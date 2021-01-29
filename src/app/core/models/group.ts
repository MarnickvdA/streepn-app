import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Product, productConverter} from './product';
import {v4 as uuid} from 'uuid';
import firebase from 'firebase/app';
import {Account} from '@core/models/account';
import {UserAccount, userAccountConverter, UserRole} from '@core/models/user-account';
import {SharedAccount, sharedAccountConverter} from '@core/models/shared-account';
import {balanceConverter} from '@core/models/balance';
import User = firebase.User;
import TimestampFn = firebase.firestore.Timestamp;

require('firebase/firestore');

/**
 * List of supported currencies currently available in the application.
 */
export enum Currency {
    EURO = 'EUR'
}

/**
 * A Group is used for keeping track of transactions and stock for a group of users (represented as UserAccounts).
 */
export class Group {
    readonly id: string;
    createdAt: Timestamp;
    settledAt?: Timestamp;
    isSettling?: boolean;
    name: string;
    currency: Currency;
    inviteLink: string;
    inviteLinkExpiry: Timestamp; // A week after generation.
    members: string[]; // List of user ids which is used for querying the current user's groups.

    // Private arrays for the accounts and products. They need to be in sync with the groupDictionary.
    private mAccounts: UserAccount[];
    private mSharedAccounts: SharedAccount[];
    private mProducts: Product[];

    // We use totalIn and totalOut of the whole group to account for the difference that can occur between the stock and the sold products.
    totalIn: number;
    totalOut: number;

    // A lookup dictionary for improved performance. Every array is very expensive to search through and maps are more efficient.
    groupDictionary: {
        accounts: {
            [accountId: string]: UserAccount
        },
        sharedAccounts: {
            [accountId: string]: SharedAccount
        },
        products: {
            [productId: string]: Product
        }
    };

    static new(user: User, name: string, currency: Currency) {
        const uid = uuid();
        const account = UserAccount.new(uid, user.uid, user.displayName, [UserRole.ADMIN], user.photoURL);

        return new Group(uuid(), TimestampFn.now(), name, currency, undefined, undefined, [user.uid], [account],
            [], [], 0, 0);
    }

    constructor(id: string,
                createdAt: Timestamp,
                name: string,
                currency: Currency,
                inviteLink: string,
                inviteLinkExpiry: Timestamp,
                members: string[],
                accounts: UserAccount[],
                products: Product[],
                sharedAccounts: SharedAccount[],
                totalIn: number,
                totalOut: number,
                settledAt?: Timestamp,
                isSettling?: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.currency = currency;
        this.inviteLink = inviteLink;
        this.inviteLinkExpiry = inviteLinkExpiry;
        this.members = members;
        this.mAccounts = accounts;
        this.mProducts = products;
        this.mSharedAccounts = sharedAccounts;
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.settledAt = settledAt;
        this.isSettling = isSettling || false;

        this.setDictionary();
    }


    get accounts(): UserAccount[] {
        return this.mAccounts;
    }

    set accounts(value: UserAccount[]) {
        this.mAccounts = value;
        this.setUserAccounts();
    }

    get settleSharedAccounts(): SharedAccount[] {
        return this.mSharedAccounts.filter(acc => {
            return acc.balance.amount !== 0;
        });
    }

    get sharedAccounts(): SharedAccount[] {
        return this.mSharedAccounts;
    }

    set sharedAccounts(value: SharedAccount[]) {
        this.mSharedAccounts = value;
        this.setSharedAccounts();
    }

    get products(): Product[] {
        return this.mProducts;
    }

    set products(value: Product[]) {
        this.mProducts = value;
        this.setProducts();
    }

    get isSettleable(): boolean {
        return !(this.mSharedAccounts.find((acc) => !acc.canLeaveGroup) || this.mProducts.find((product) => product.stock < 0));
    }

    isAdmin(userId: string): boolean {
        return this.accounts.find(account => account.userId === userId)?.roles.includes(UserRole.ADMIN) || false;
    }

    getAccountById(accountId: string): Account | undefined {
        const userAccount = this.getUserAccountById(accountId);
        if (userAccount) {
            return userAccount as unknown as Account;
        } else {
            return this.getSharedAccountById(accountId) as unknown as Account;
        }
    }

    getAccountsById(accountIds: string[]): Account[] {
        const accounts: Account[] = [];

        accountIds.forEach(accountId => {
            accounts.push(this.getAccountById(accountId));
        });

        return accounts;
    }

    getUserAccountById(accountId: string): UserAccount | undefined {
        return this.groupDictionary.accounts[accountId];
    }

    getSharedAccountById(accountId: string): SharedAccount | undefined {
        return this.groupDictionary.sharedAccounts[accountId];
    }

    getProductById(productId: string): Product | undefined {
        return this.groupDictionary.products[productId];
    }

    private setDictionary() {
        const newDict = {
            accounts: {},
            sharedAccounts: {},
            products: {},
        };

        newDict.accounts = this.setUserAccounts(false);
        newDict.sharedAccounts = this.setSharedAccounts(false);
        newDict.products = this.setProducts(false);

        this.groupDictionary = newDict;
    }


    private setUserAccounts(persist: boolean = true) {
        const newDict = {};

        this.mAccounts.forEach(acc => {
            newDict[acc.id] = acc;
        });

        if (persist) {
            this.groupDictionary.accounts = newDict;
        } else {
            return newDict;
        }
    }

    private setSharedAccounts(persist: boolean = true) {
        const newDict = {};

        this.mSharedAccounts.forEach(acc => {
            newDict[acc.id] = acc;
        });

        if (persist) {
            this.groupDictionary.sharedAccounts = newDict;
        } else {
            return newDict;
        }
    }

    private setProducts(persist: boolean = true) {
        const newDict = {};

        this.mProducts.forEach(pr => {
            newDict[pr.id] = pr;
        });

        if (persist) {
            this.groupDictionary.products = newDict;
        } else {
            return newDict;
        }
    }

    deepCopy(): Group {
        return JSON.parse(JSON.stringify(this));
    }

    getUserAccountByUserId(uid: string) {
        return this.accounts.find(acc => acc.userId === uid) as UserAccount;
    }
}

export const groupConverter: FirestoreDataConverter<Group> = {
    toFirestore(group: Group) {

        const balances = {};
        group.accounts.forEach((account) => {
            balances[account.id] = balanceConverter.toFirestore(account.balance);
        });

        group.sharedAccounts.forEach((account) => {
            balances[account.id] = balanceConverter.toFirestore(account.balance);
        });

        const productData = {};
        group.products.forEach((product) => {
            productData[product.id] = {
                stock: product.stock,
                totalIn: product.totalIn,
                totalOut: product.totalOut,
                amountIn: product.amountIn,
                amountOut: product.amountOut,
            };
        });

        return {
            createdAt: group.createdAt,
            name: group.name,
            currency: group.currency,
            inviteLink: group.inviteLink,
            inviteLinkExpiry: group.inviteLinkExpiry,
            members: group.members,
            accounts: group.accounts.map((account) => userAccountConverter.toFirestore(account)),
            products: group.products.map((product) => productConverter.toFirestore(product)),
            sharedAccounts: group.sharedAccounts.map((account) => sharedAccountConverter.toFirestore(account)),
            totalIn: group.totalIn,
            totalOut: group.totalOut,
            balances,
            productData,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Group {
        const data = snapshot.data(options);

        return newGroup(snapshot.id, data);
    }
};

export function newGroup(id: string, data: { [key: string]: any }): Group {
    const accounts = [];
    const products = [];
    const sharedAccounts = [];

    data.accounts?.forEach((account) => {
        account.balance = data.balances[account.id];
        accounts.push(userAccountConverter.newAccount(account));
    });

    data.sharedAccounts?.forEach((sharedAccount) => {
        sharedAccount.balance = data.balances[sharedAccount.id];
        sharedAccounts.push(sharedAccountConverter.newSharedAccount(sharedAccount));
    });

    data.products?.forEach((product) => {
        const productData = data.productData[product.id];

        if (productData) {
            product.totalIn = productData.totalIn;
            product.totalOut = productData.totalOut;
            product.amountIn = productData.amountIn;
            product.amountOut = productData.amountOut;
        }

        products.push(productConverter.newProduct(product));
    });

    return new Group(id, data.createdAt, data.name, data.currency, data.inviteLink,
        data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts, data.totalIn,
        data.totalOut, data.settledAt, data.isSettling);
}

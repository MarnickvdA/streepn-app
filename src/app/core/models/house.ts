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
 * A House is used for keeping track of transactions and stock for a house with students (represented as UserAccounts).
 */
export class House {
    readonly id: string;
    createdAt: Timestamp;
    settledAt?: Timestamp;
    isSettling?: boolean;
    name: string;
    currency: Currency;
    inviteLink: string;
    inviteLinkExpiry: Timestamp; // A week after generation.
    members: string[]; // List of user ids which is used for querying the current user's houses.
    // We use totalIn and totalOut of the whole house to account for the difference that can occur between the stock and the sold products.
    totalIn: number;
    totalOut: number;
    // A lookup dictionary for improved performance. Every array is very expensive to search through and maps are more efficient.
    houseDictionary: {
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
    // Private arrays for the accounts and products. They need to be in sync with the houseDictionary.
    private mAccounts: UserAccount[];
    private mSharedAccounts: SharedAccount[];
    private mProducts: Product[];

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
        return !(this.mSharedAccounts.find((acc) => !acc.isRemovable) || this.mProducts.find((product) => product.stock < 0));
    }

    static new(user: User, name: string, currency: Currency) {
        const uid = uuid();
        const hid = uuid();
        const account = UserAccount.new(uid, user.uid, user.displayName, [UserRole.ADMIN], user.photoURL);

        return new House(hid, TimestampFn.now(), name, currency, undefined, undefined, [user.uid], [account],
            [], [], 0, 0);
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
        return this.houseDictionary.accounts[accountId];
    }

    getSharedAccountById(accountId: string): SharedAccount | undefined {
        return this.houseDictionary.sharedAccounts[accountId];
    }

    getProductById(productId: string): Product | undefined {
        return this.houseDictionary.products[productId];
    }

    deepCopy(): House {
        return JSON.parse(JSON.stringify(this));
    }

    getUserAccountByUserId(uid: string) {
        return this.accounts.find(acc => acc.userId === uid) as UserAccount;
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

        this.houseDictionary = newDict;
    }

    private setUserAccounts(persist: boolean = true) {
        const newDict = {};

        this.mAccounts.forEach(acc => {
            newDict[acc.id] = acc;
        });

        if (persist) {
            this.houseDictionary.accounts = newDict;
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
            this.houseDictionary.sharedAccounts = newDict;
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
            this.houseDictionary.products = newDict;
        } else {
            return newDict;
        }
    }
}

export const houseConverter: FirestoreDataConverter<House> = {
    toFirestore(house: House) {
        const balances = {};
        house.accounts.forEach((account) => {
            balances[account.id] = balanceConverter.toFirestore(account.balance);
        });

        house.sharedAccounts.forEach((account) => {
            balances[account.id] = balanceConverter.toFirestore(account.balance);
        });

        const productData = {};
        house.products.forEach((product) => {
            productData[product.id] = {
                stock: product.stock,
                totalIn: product.totalIn,
                totalOut: product.totalOut,
                amountIn: product.amountIn,
                amountOut: product.amountOut,
            };
        });

        return {
            createdAt: house.createdAt,
            name: house.name,
            currency: house.currency,
            inviteLink: house.inviteLink,
            inviteLinkExpiry: house.inviteLinkExpiry,
            members: house.members,
            accounts: house.accounts.map((account) => userAccountConverter.toFirestore(account)),
            products: house.products.map((product) => productConverter.toFirestore(product)),
            sharedAccounts: house.sharedAccounts.map((account) => sharedAccountConverter.toFirestore(account)),
            totalIn: house.totalIn,
            totalOut: house.totalOut,
            balances,
            productData,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): House {
        const data = snapshot.data(options);

        return newHouse(snapshot.id, data);
    }
};

export function newHouse(id: string, data: { [key: string]: any }): House {
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

    return new House(id, data.createdAt, data.name, data.currency, data.inviteLink,
        data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts, data.totalIn,
        data.totalOut, data.settledAt, data.isSettling);
}

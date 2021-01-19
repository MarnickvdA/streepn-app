import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Product, productConverter} from './product';
import {Account, SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter, UserRole} from './account';

/**
 * Helper interface for readability of the code within the Group class. Amount is the current balance, based on the totalIn and totalOut.
 */
export interface Balance {
    amount: number;
    totalIn: number;
    totalOut: number;
}

/**
 * List of supported valutas currently available in the application.
 */
export enum Valuta {
    EURO = 'EUR'
}

/**
 * A Group is used for keeping track of transactions and stock for a group of users (represented as UserAccounts).
 */
export class Group {
    readonly id: string;
    createdAt: Timestamp;
    name: string;
    valuta: Valuta;
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

    // Balances of all accounts, findable through the accountId. This is the fastest way to query balances for accounts.
    balances: {
        [accountId: string]: Balance
    };

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

    constructor(id: string,
                createdAt: Timestamp,
                name: string,
                valuta: Valuta,
                inviteLink: string,
                inviteLinkExpiry: Timestamp,
                members: string[],
                accounts: UserAccount[],
                products: Product[],
                sharedAccounts: SharedAccount[],
                totalIn: number,
                totalOut: number,
                balances: {
                    [id: string]: Balance
                }) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.valuta = valuta;
        this.inviteLink = inviteLink;
        this.inviteLinkExpiry = inviteLinkExpiry;
        this.members = members;
        this.mAccounts = accounts;
        this.mProducts = products;
        this.mSharedAccounts = sharedAccounts;
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.balances = balances;

        this.setDictionary();
    }


    get accounts(): UserAccount[] {
        return this.mAccounts;
    }

    set accounts(value: UserAccount[]) {
        this.mAccounts = value;
        this.setUserAccounts();
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

    isAdmin(userId: string): boolean {
        return this.accounts.find(account => account.userId === userId)?.roles.includes(UserRole.ADMIN) || false;
    }

    getAccountBalance(accountId: string): Balance {
        return this.balances[accountId];
    }

    canLeaveGroup(accountId: string): boolean {
        return this.balances[accountId].totalIn === 0 && this.balances[accountId].totalOut === 0;
    }

    getAccountById(accountId: string): Account | undefined {
        const userAccount = this.getUserAccountById(accountId);
        if (userAccount) {
            return userAccount;
        } else {
            return this.getSharedAccountById(accountId);
        }
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
}

export const groupConverter: FirestoreDataConverter<Group> = {
    toFirestore(group: Group) {
        return {
            createdAt: group.createdAt,
            name: group.name,
            valuta: group.valuta,
            inviteLink: group.inviteLink,
            inviteLinkExpiry: group.inviteLinkExpiry,
            members: group.members,
            accounts: group.accounts.map((account) => userAccountConverter.toFirestore(account)),
            products: group.products.map((product) => productConverter.toFirestore(product)),
            sharedAccounts: group.sharedAccounts.map((account) => sharedAccountConverter.toFirestore(account)),
            totalIn: group.totalIn,
            totalOut: group.totalOut,
            balances: group.balances,
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

    data.accounts?.forEach((account) => accounts.push(userAccountConverter.newAccount(account)));
    data.products?.forEach((product) => products.push(productConverter.newProduct(product)));
    data.sharedAccounts?.forEach((sharedAccount) =>
        sharedAccounts.push(sharedAccountConverter.newSharedAccount(sharedAccount)));

    return new Group(id, data.createdAt, data.name, data.valuta, data.inviteLink,
        data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts, data.totalIn, data.totalOut, data.balances);
}

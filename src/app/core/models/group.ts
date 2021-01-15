import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Product, productConverter} from './product';
import {Account, SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter} from './account';

export interface Balance {
    amount: number;
    totalIn: number;
    totalOut: number;
}

export class Group {
    readonly id: string;
    createdAt: Timestamp;
    name: string;
    valuta: string;
    inviteLink: string;
    inviteLinkExpiry: Timestamp;
    members: string[];
    private mAccounts: UserAccount[];
    private mSharedAccounts: SharedAccount[];
    private mProducts: Product[];
    totalIn: number;
    totalOut: number;
    balances: {
        [id: string]: Balance
    };

    groupDictionary: {
        accounts: {
            [id: string]: UserAccount
        },
        sharedAccounts: {
            [id: string]: SharedAccount
        },
        products: {
            [id: string]: Product
        }
    };

    constructor(id: string,
                createdAt: Timestamp,
                name: string,
                valuta: string,
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
        const accounts = [];
        const products = [];
        const sharedAccounts = [];

        group.accounts?.forEach((account) => accounts.push(userAccountConverter.toFirestore(account)));
        group.products?.forEach((product) => products.push(productConverter.toFirestore(product)));
        group.sharedAccounts?.forEach((sharedAccount) => sharedAccounts.push(sharedAccountConverter.toFirestore(sharedAccount)));

        return {
            createdAt: group.createdAt,
            name: group.name,
            valuta: group.valuta,
            inviteLink: group.inviteLink,
            inviteLinkExpiry: group.inviteLinkExpiry,
            members: group.members,
            accounts,
            products,
            sharedAccounts,
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

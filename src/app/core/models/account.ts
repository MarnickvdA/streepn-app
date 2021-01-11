import {Timestamp} from '@firebase/firestore-types';

export abstract class Account {
    id: string;
    createdAt: Timestamp;
    name: string;
    balance: number;
    type: string;
    metadata?: {
        [key: string]: unknown
    };

    protected constructor(id: string, createdAt: Timestamp, name: string, balance: number, type: string) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.type = type;
    }
}

export class UserAccount extends Account {
    userId: string;
    photoUrl?: string;
    roles: string[];

    constructor(id: string, userId: string, createdAt: Timestamp, name: string, balance: number, roles: string[], photoUrl: string) {
        super(id, createdAt, name, balance, 'user');
        this.userId = userId;
        this.roles = roles || [];
        this.photoUrl = photoUrl;
    }
}

export class SharedAccount extends Account {
    id: string;
    createdAt: Timestamp;
    name: string;
    balance: number;
    accounts: string[];

    constructor(id: string, createdAt: Timestamp, name: string, balance: number, accounts: string[]) {
        super(id, createdAt, name, balance, 'shared');
        this.accounts = accounts;
    }
}

export const accountConverter = {
    toFirestore(account: Account) {
        return {
            id: account.id,
            createdAt: account.createdAt,
            name: account.name,
            balance: account.balance,
            type: account.type,
        };
    }
};

export const userAccountConverter = {
    toFirestore(userAccount: UserAccount) {
        return {
            id: userAccount.id,
            userId: userAccount.userId,
            createdAt: userAccount.createdAt,
            name: userAccount.name,
            balance: userAccount.balance,
            type: 'user',
            roles: userAccount.roles,
            photoUrl: userAccount.photoUrl
        };
    },
    newAccount(data: { [key: string]: any }): UserAccount {
        return new UserAccount(data.id, data.userId, data.createdAt, data.name, data.balance, data.roles, data.photoUrl);
    }
};

export const sharedAccountConverter = {
    toFirestore(sharedAccount: SharedAccount) {
        return {
            id: sharedAccount.id,
            createdAt: sharedAccount.createdAt,
            name: sharedAccount.name,
            balance: sharedAccount.balance,
            type: 'shared',
            accounts: sharedAccount.accounts
        };
    },
    newSharedAccount(data: { [key: string]: any }): SharedAccount {
        return new SharedAccount(data.id, data.createdAt, data.name, data.balance, data.accounts);
    }
};



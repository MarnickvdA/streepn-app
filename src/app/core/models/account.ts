import {Timestamp} from '@firebase/firestore-types';
import {getMoneyString} from '@core/utils/firestore-utils';

export abstract class Account {
    id: string;
    createdAt: Timestamp;
    name: string;
    balance: number;
    type: string;
    readonly totalIn: number;
    readonly totalOut: number;
    settledAt: Timestamp;
    metadata?: {
        [key: string]: unknown
    };

    protected constructor(id: string, createdAt: Timestamp, name: string, balance: number, type: string,
                          totalIn: number, totalOut: number, settledAt?: Timestamp) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.type = type;
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.settledAt = settledAt;
    }

    get totalInString(): string {
        return getMoneyString(this.totalIn);
    }

    get totalOutString(): string {
        return getMoneyString(this.totalOut);
    }

    get balanceString(): string {
        return getMoneyString(this.balance);
    }

    get canLeaveGroup(): boolean {
        return this.totalIn === 0 && this.totalOut === 0;
    }
}

export class UserAccount extends Account {
    userId: string;
    photoUrl?: string;
    roles: string[];

    constructor(id: string, userId: string, createdAt: Timestamp, name: string, balance: number,
                totalIn: number, totalOut: number, roles: string[], photoUrl: string, settledAt?: Timestamp) {
        super(id, createdAt, name, balance, 'user', totalIn, totalOut, settledAt);
        this.userId = userId;
        this.roles = roles || [];
        this.photoUrl = photoUrl;
    }
}

export class SharedAccount extends Account {
    accounts: string[];

    constructor(id: string, createdAt: Timestamp, name: string, balance: number, totalIn: number,
                totalOut: number, accounts: string[], settledAt?: Timestamp) {
        super(id, createdAt, name, balance, 'shared', totalIn, totalOut, settledAt);
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
            totalIn: account.totalIn,
            totalOut: account.totalOut,
            settledAt: account.settledAt,
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
            totalIn: userAccount.totalIn,
            totalOut: userAccount.totalOut,
            type: 'user',
            roles: userAccount.roles,
            photoUrl: userAccount.photoUrl,
            settledAt: userAccount.settledAt,
        };
    },
    newAccount(data: { [key: string]: any }): UserAccount {
        return new UserAccount(data.id, data.userId, data.createdAt, data.name, data.balance,
            data.totalIn, data.totalOut, data.roles, data.photoUrl, data.settledAt);
    }
};

export const sharedAccountConverter = {
    toFirestore(sharedAccount: SharedAccount) {
        return {
            id: sharedAccount.id,
            createdAt: sharedAccount.createdAt,
            name: sharedAccount.name,
            balance: sharedAccount.balance,
            totalIn: sharedAccount.totalIn,
            totalOut: sharedAccount.totalOut,
            type: 'shared',
            accounts: sharedAccount.accounts,
            settledAt: sharedAccount.settledAt,
        };
    },
    newSharedAccount(data: { [key: string]: any }): SharedAccount {
        return new SharedAccount(data.id, data.createdAt, data.name, data.balance,
            data.totalIn, data.totalOut, data.accounts, data.settledAt);
    }
};



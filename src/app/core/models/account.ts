import {Timestamp} from '@firebase/firestore-types';

export abstract class Account {
    id: string;
    createdAt: Timestamp;
    name: string;
    type: string;
    settledAt: Timestamp;
    metadata?: {
        [key: string]: unknown
    };

    protected constructor(id: string, createdAt: Timestamp, name: string, type: string, settledAt?: Timestamp) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.type = type;
        this.settledAt = settledAt;
    }
}

export const accountConverter = {
    toFirestore(account: Account) {
        return {
            id: account.id,
            createdAt: account.createdAt,
            name: account.name,
            type: account.type,
            settledAt: account.settledAt,
        };
    }
};


export class UserAccount extends Account {
    userId: string;
    photoUrl?: string;
    roles: string[];

    constructor(id: string, userId: string, createdAt: Timestamp, name: string, roles: string[], photoUrl: string, settledAt?: Timestamp) {
        super(id, createdAt, name, 'user', settledAt);
        this.userId = userId;
        this.roles = roles || [];
        this.photoUrl = photoUrl;
    }
}

export const userAccountConverter = {
    toFirestore(userAccount: UserAccount) {
        const accountObject = accountConverter.toFirestore(userAccount);

        const userAccountObject = {
            userId: userAccount.userId,
            roles: userAccount.roles,
            photoUrl: userAccount.photoUrl,
        };

        return {...accountObject, ...userAccountObject};
    },
    newAccount(data: { [key: string]: any }): UserAccount {
        return new UserAccount(data.id, data.userId, data.createdAt, data.name, data.roles, data.photoUrl, data.settledAt);
    }
};


export class SharedAccount extends Account {
    accounts: string[];

    constructor(id: string, createdAt: Timestamp, name: string, accounts: string[], settledAt?: Timestamp) {
        super(id, createdAt, name, 'shared', settledAt);
        this.accounts = accounts;
    }
}


export const sharedAccountConverter = {
    toFirestore(sharedAccount: SharedAccount) {
        const accountObject = accountConverter.toFirestore(sharedAccount);

        const sharedAccountObject = {
            accounts: sharedAccount.accounts,
        };

        return {...accountObject, ...sharedAccountObject};
    },
    newSharedAccount(data: { [key: string]: any }): SharedAccount {
        return new SharedAccount(data.id, data.createdAt, data.name, data.accounts, data.settledAt);
    }
};



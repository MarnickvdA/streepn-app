import {Timestamp} from '@firebase/firestore-types';

export class Account {
    readonly userId: string;
    readonly createdAt: Timestamp;
    name: string;
    balance: number;
    roles: string[];


    constructor(userId: string, createdAt: Timestamp, name: string, balance: number, roles: string[]) {
        this.userId = userId;
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.roles = roles;
    }
}

export const accountConverter = {
    toFirestore(account: Account) {
        return {
            userId: account.userId,
            createdAt: account.createdAt,
            name: account.name,
            balance: account.balance,
            roles: account.roles
        };
    },
    newAccount(data: { [key: string]: any }): Account {
        return new Account(data.userId, data.createdAt, data.name, data.balance, data.roles);
    }
};


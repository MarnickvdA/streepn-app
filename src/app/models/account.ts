import {Timestamp} from '@firebase/firestore-types';

export class Account {
    readonly id: string;
    readonly userId: string;
    readonly createdAt: Timestamp;
    name: string;
    balance: number;
    roles: string[];


    constructor(id: string, userId: string, createdAt: Timestamp, name: string, balance: number, roles: string[]) {
        this.id = id;
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
    newAccount(id, data: { [key: string]: any }): Account {
        return new Account(id, data.userId, data.createdAt, data.name, data.balance, data.roles);
    }
};


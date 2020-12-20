import {Timestamp} from '@firebase/firestore-types';

export class SharedAccount {
    readonly createdAt: Timestamp;
    name: string;
    balance: number;
    accounts: string[];

    constructor(createdAt: Timestamp, name: string, balance: number, accounts: string[]) {
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.accounts = accounts;
    }
}

export const sharedAccountConverter = {
    toFirestore(sharedAccount: SharedAccount) {
        return {
            createdAt: sharedAccount.createdAt,
            name: sharedAccount.name,
            balance: sharedAccount.balance,
            accounts: sharedAccount.accounts
        };
    },
    newSharedAccount(data: { [key: string]: any }): SharedAccount {
        return new SharedAccount(data.createdAt, data.name, data.balance, data.accounts);
    }
};


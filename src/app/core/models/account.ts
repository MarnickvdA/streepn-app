import {Timestamp} from '@firebase/firestore-types';
import {Balance} from '@core/models/balance';

/**
 * The account class is the abstract super class of several types of accounts. It holds the basic information for interacting within a
 * House. Accounts are meant to serve as (a collection of) users which can do actions in a house. This includes doing transactions, updating
 * stock and more. The balance of an account is not handled within the Account class because of a design choice for ACID database operations
 * The balance of an account can only be changed server-side. If we would have implemented it client-side, the whole Account object would
 * need to be updated due to Firestore restrictions. This would yield problematic states, as changing the name of an account would also
 * update the balance. Due to client-2-server latency, this could cause problems in terms of concurrency.
 *
 * The balance of any Account within a house can be gotten from a helper function in House.
 */
export abstract class Account {
    id: string;
    createdAt: Timestamp;
    name: string;

    // Filter label for the sub-types of Account. Useful for quick checking which type the account is.
    type: AccountType;

    // This value is retrieved from House but with Firestore conversion saved to Account object
    balance: Balance;

    // Moment in time when the account was last settled. Transactions until this time cannot be edited for this account.
    settledAt: Timestamp;

    protected constructor(id: string, createdAt: Timestamp, name: string, type: AccountType, balance: Balance, settledAt?: Timestamp) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.type = type;
        this.balance = new Balance(balance?.totalIn, balance?.totalOut, balance?.products);
        this.settledAt = settledAt;
    }

    deepCopy(): Account {
        return JSON.parse(JSON.stringify(this));
    }

    get isRemovable(): boolean {
        return this.balance.totalIn === 0 && this.balance.totalOut === 0;
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

export enum AccountType {
    USER = 'user',
    SHARED = 'shared'
}

import {Timestamp} from '@firebase/firestore-types';

/**
 * The account class is the abstract super class of several types of accounts. It holds the basic information for interacting within a
 * Group. Accounts are meant to serve as (a collection of) users which can do actions in a group. This includes doing transactions, updating
 * stock and more. The balance of an account is not handled within the Account class because of a design choice for ACID database operations
 * The balance of an account can only be changed server-side. If we would have implemented it client-side, the whole Account object would
 * need to be updated due to Firestore restrictions. This would yield problematic states, as changing the name of an account would also
 * update the balance. Due to client-2-server latency, this could cause problems in terms of concurrency.
 *
 * The balance of any Account within a group can be gotten from a helper function in Group.
 */
export abstract class Account {
    id: string;
    createdAt: Timestamp;
    name: string;

    // Filter label for the sub-types of Account. Useful for quick checking which type the account is.
    type: AccountType;

    // Moment in time when the account was last settled. Transactions until this time cannot be edited for this account.
    settledAt: Timestamp;

    protected constructor(id: string, createdAt: Timestamp, name: string, type: AccountType, settledAt?: Timestamp) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.type = type;
        this.settledAt = settledAt;
    }

    deepCopy(): Account {
        return JSON.parse(JSON.stringify(this));
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

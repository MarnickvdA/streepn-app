import firebase from 'firebase/app';
import {Timestamp} from '@firebase/firestore-types';
import {v4 as uuid} from 'uuid';
import {Account, accountConverter, AccountType} from '@core/models/account';
import {Balance} from '@core/models/balance';

require('firebase/firestore');
import TimestampFn = firebase.firestore.Timestamp;

export class SharedAccount extends Account {

    constructor(id: string, createdAt: Timestamp, name: string, balance: Balance, settledAt?: Timestamp) {
        super(id, createdAt, name, AccountType.SHARED, balance, settledAt);
    }

    static new(accountName: string) {
        return new SharedAccount(uuid(), TimestampFn.now(), accountName, Balance.new());
    }

    deepCopy(): SharedAccount {
        return JSON.parse(JSON.stringify(this));
    }
}


export const sharedAccountConverter = {
    toFirestore(sharedAccount: SharedAccount) {
        return accountConverter.toFirestore(sharedAccount);
    },
    newSharedAccount(data: { [key: string]: any }): SharedAccount {
        return new SharedAccount(data.id, data.createdAt, data.name, data.balance, data.settledAt);
    }
};

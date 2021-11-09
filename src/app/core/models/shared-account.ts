import firebase from 'firebase/app';
import {Timestamp} from '@firebase/firestore-types';
import {v4 as uuid} from 'uuid';
import {Account, accountConverter, AccountType} from '@core/models/account';
import {Balance} from '@core/models/balance';

require('firebase/firestore');
import TimestampFn = firebase.firestore.Timestamp;

export class SharedAccount extends Account {

    constructor(id: string, createdAt: Timestamp, name: string, balance: Balance, settledAt?: Timestamp, photoUrl?: string, removed?: boolean) {
        super(id, createdAt, name, AccountType.shared, balance, settledAt, photoUrl, removed);
    }

    static new(accountName: string) {
        return new SharedAccount(uuid(), TimestampFn.now(), accountName, Balance.new());
    }

    deepCopy(): SharedAccount {
        return JSON.parse(JSON.stringify(this));
    }
}

export const sharedAccountConverter = {
    toFirestore: (sharedAccount: SharedAccount) => accountConverter.toFirestore(sharedAccount),
    newSharedAccount: (data: { [key: string]: any }): SharedAccount => new SharedAccount(data.id, data.createdAt, data.name,
        data.balance, data.settledAt, data.photoUrl, data.removed)
};

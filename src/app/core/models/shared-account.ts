import firebase from 'firebase/app';
import {Timestamp} from '@firebase/firestore-types';
import {v4 as uuidv4} from 'uuid';

require('firebase/firestore');
import TimestampFn = firebase.firestore.Timestamp;
import {Account, accountConverter, AccountType} from '@core/models/account';

export class SharedAccount extends Account {
    accounts: string[];

    constructor(id: string, createdAt: Timestamp, name: string, accounts: string[], settledAt?: Timestamp) {
        super(id, createdAt, name, AccountType.SHARED, settledAt);
        this.accounts = accounts;
    }

    static new(accountName: string) {
        return new SharedAccount(uuidv4(), TimestampFn.now(), accountName, [], undefined);
    }

    deepCopy(): SharedAccount {
        return JSON.parse(JSON.stringify(this));
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

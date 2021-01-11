import {Injectable} from '@angular/core';
import {Group, SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter} from '../models';
import {AngularFirestore} from '@angular/fire/firestore';
import {v4 as uuidv4} from 'uuid';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;


@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private fs: AngularFirestore) {
    }

    updateUserAccount(group: Group, account: UserAccount) {
        group.accounts = group.accounts.map(obj => {
            if (obj.id === account.id) {
                return account;
            } else {
                return obj;
            }
        });

        return this.setUserAccounts(group);
    }

    addSharedAccount(group: Group, accountName: string) {
        // TODO Add validity checks.

        const sharedAccount = new SharedAccount(uuidv4(), Timestamp.now(), accountName, 0, 0, 0,[]);

        group.sharedAccounts.push(sharedAccount);

        return this.setSharedAccounts(group);
    }

    updateSharedAccount(group: Group, sharedAccount: SharedAccount) {
        group.sharedAccounts = group.sharedAccounts.map(obj => {
            if (obj.id === sharedAccount.id) {
                return sharedAccount;
            } else {
                return obj;
            }
        });

        return this.setSharedAccounts(group);
    }

    removeSharedAccount(group: Group, sharedAccount: SharedAccount) {
        group.sharedAccounts = group.sharedAccounts.filter(obj => obj.id !== sharedAccount.id);

        return this.setSharedAccounts(group);
    }

    private setUserAccounts(group: Group): Promise<void> {
        // TODO Clearer would be using Cloud Functions, but money restrictions...
        // FIXME Balance is dependent on this update, so inconsistency can occur...
        return this.fs.collection('groups').doc(group.id).set({
            accounts: group.accounts.map(ua => userAccountConverter.toFirestore(ua))
        }, {merge: true});
    }

    private setSharedAccounts(group: Group): Promise<void> {
        // TODO Clearer would be using Cloud Functions, but money restrictions...
        return this.fs.collection('groups').doc(group.id).set({
            sharedAccounts: group.sharedAccounts.map(sa => sharedAccountConverter.toFirestore(sa))
        }, {merge: true});
    }
}

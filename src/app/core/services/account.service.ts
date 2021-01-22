import {Injectable} from '@angular/core';
import {Balance, Group, SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter} from '../models';
import {AngularFirestore} from '@angular/fire/firestore';

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
        const sharedAccount = SharedAccount.new(accountName);

        group.sharedAccounts.push(sharedAccount);

        return Promise.all([
            this.setSharedAccounts(group),
            this.addSharedAccountBalance(group.id, sharedAccount.id)
        ]);
    }

    updateSharedAccount(group: Group, account: SharedAccount) {
        group.sharedAccounts = group.sharedAccounts.map(obj => {
            if (obj.id === account.id) {
                return account;
            } else {
                return obj;
            }
        });

        return this.setSharedAccounts(group);
    }

    private setUserAccounts(group: Group): Promise<void> {
        return this.fs.collection('groups').doc(group.id).set({
            accounts: group.accounts.map(ua => userAccountConverter.toFirestore(ua))
        }, {merge: true});
    }

    private setSharedAccounts(group: Group): Promise<void> {
        return this.fs.collection('groups').doc(group.id).set({
            sharedAccounts: group.sharedAccounts.map(sa => sharedAccountConverter.toFirestore(sa))
        }, {merge: true});
    }

    private addSharedAccountBalance(groupId: string, accountId: string) {
        const newBalance: Balance = { // not the shoe though lol
            amount: 0,
            totalIn: 0,
            totalOut: 0,
        };

        return this.fs.collection('groups').doc(groupId).update({
            [`balances.${accountId}`]: newBalance
        });
    }
}

import {Injectable} from '@angular/core';
import {Balance, House, SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter} from '../../models';
import {Observable, throwError} from 'rxjs';
import {AuthService} from '@core/services';
import {doc, Firestore, setDoc, updateDoc} from '@angular/fire/firestore';
import {Functions, httpsCallable} from '@angular/fire/functions';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    constructor(private authService: AuthService,
                private firestore: Firestore,
                private functions: Functions) {
    }

    updateUserAccount(house: House, account: UserAccount) {
        if (!this.authService.currentUserIsAdmin(house)) {
            return Promise.reject('Permission denied');
        }

        house.accounts = house.accounts.map(obj => {
            if (obj.id === account.id) {
                return account;
            } else {
                return obj;
            }
        });

        return this.setUserAccounts(house);
    }

    addSharedAccount(house: House, accountName: string): Promise<void[]> {
        if (!this.authService.currentUserIsAdmin(house)) {
            return Promise.reject('Permission denied');
        }

        const sharedAccount = SharedAccount.new(accountName);

        house.sharedAccounts.push(sharedAccount);

        return Promise.all([
            this.setSharedAccounts(house),
            this.addSharedAccountBalance(house.id, sharedAccount.id)
        ]);
    }

    updateSharedAccount(house: House, account: SharedAccount) {
        if (!this.authService.currentUserIsAdmin(house)) {
            return Promise.reject('Permission denied');
        }

        house.sharedAccounts = house.sharedAccounts.map(obj => {
            if (obj.id === account.id) {
                return account;
            } else {
                return obj;
            }
        });

        return this.setSharedAccounts(house);
    }

    removeSharedAccount(house: House, account: SharedAccount): Observable<any> {
        if (!this.authService.currentUserIsAdmin(house)) {
            return throwError('Permission denied');
        }

        if (house.isSettling) {
            return throwError('Cannot remove shared account while settling the house');
        }
        const sharedAccount = house.getSharedAccountById(account.id);
        if (!sharedAccount) {
            return throwError('Shared account not found');
        }

        if (!sharedAccount.isRemovable) {
            return throwError('Shared account cannot be removed');
        }

        httpsCallable(this.functions, 'removeSharedAccount').call({
            houseId: house.id,
            sharedAccountId: account.id,
        });
    }

    private setUserAccounts(house: House): Promise<void> {
        const houseRef = doc(this.firestore, `houses/${house.id}`);
        return setDoc(houseRef, {
            accounts: house.accounts.map(ua => userAccountConverter.toFirestore(ua))
        }, {
            merge: true
        });
    }

    private setSharedAccounts(house: House): Promise<void> {
        const houseRef = doc(this.firestore, `houses/${house.id}`);
        return setDoc(houseRef, {
            sharedAccounts: house.sharedAccounts.map(sa => sharedAccountConverter.toFirestore(sa))
        }, {
            merge: true
        });
    }

    private addSharedAccountBalance(houseId: string, accountId: string) {
        const newBalance: Balance = { // not the shoe though lol
            amount: 0,
            totalIn: 0,
            totalOut: 0,
        };

        const houseRef = doc(this.firestore, `houses/${houseId}`);
        return updateDoc(houseRef, {
            [`balances.${accountId}`]: newBalance
        });
    }
}

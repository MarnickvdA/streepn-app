import {Account, accountConverter, AccountType} from '@core/models/account';
import {Balance} from '@core/models/balance';
import {Timestamp} from '@firebase/firestore-types';
import firebase from 'firebase/compat/app';

export class UserAccount extends Account {
    userId: string; // UID of the Firebase Auth user associated with this account.
    roles: UserRole[]; // Permission-system for a house.

    constructor(id: string, userId: string, createdAt: Timestamp, name: string, roles: UserRole[],
                photoUrl: string, balance: Balance, settledAt?: Timestamp, removed?: boolean) {
        super(id, createdAt, name, AccountType.user, balance, settledAt, photoUrl, removed);
        this.userId = userId;
        this.roles = roles || [];
    }

    get isAdmin(): boolean {
        return this.roles.includes(UserRole.admin);
    }

    static new(id: string, userId: string, name: string, roles: UserRole[], photoUrl: string) {
        return new UserAccount(id, userId, firebase.firestore.Timestamp.now(), name, roles, photoUrl, Balance.new(), undefined, false);
    }

    deepCopy(): UserAccount {
        return JSON.parse(JSON.stringify(this));
    }
}

export const userAccountConverter = {
    toFirestore: (userAccount: UserAccount) => {
        const accountObject = accountConverter.toFirestore(userAccount);

        const userAccountObject = {
            userId: userAccount.userId,
            roles: userAccount.roles
        };

        return {...accountObject, ...userAccountObject};
    },
    newAccount: (data: { [key: string]: any }): UserAccount => new UserAccount(data.id, data.userId, data.createdAt, data.name, data.roles,
        data.photoUrl, data.balance, data.settledAt, data.removed)
};

/**
 * Enumeration of supported user roles
 */
export enum UserRole {
    admin = 'ADMIN'
}

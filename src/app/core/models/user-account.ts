import firebase from 'firebase/app';
import {Timestamp} from '@firebase/firestore-types';
import {Account, accountConverter, AccountType} from '@core/models/account';
import {Balance} from '@core/models/balance';

require('firebase/firestore');
import TimestampFn = firebase.firestore.Timestamp;

export class UserAccount extends Account {
    userId: string; // UID of the Firebase Auth user associated with this account.
    photoUrl?: string; // URL for the photo associated with this account in a specific group.
    roles: UserRole[]; // Permission-system for a group.

    static new(id: string, userId: string, name: string, roles: UserRole[], photoUrl: string) {
        return new UserAccount(id, userId, TimestampFn.now(), name, roles, photoUrl, Balance.new());
    }

    constructor(id: string, userId: string, createdAt: Timestamp, name: string, roles: UserRole[],
                photoUrl: string, balance: Balance, settledAt?: Timestamp) {
        super(id, createdAt, name, AccountType.USER, balance, settledAt);
        this.userId = userId;
        this.roles = roles || [];
        this.photoUrl = photoUrl;
    }

    get isAdmin(): boolean {
        return this.roles.includes(UserRole.ADMIN);
    }

    deepCopy(): UserAccount {
        return JSON.parse(JSON.stringify(this));
    }
}

export const userAccountConverter = {
    toFirestore(userAccount: UserAccount) {
        const accountObject = accountConverter.toFirestore(userAccount);

        const userAccountObject = {
            userId: userAccount.userId,
            roles: userAccount.roles,
            photoUrl: userAccount.photoUrl,
        };

        return {...accountObject, ...userAccountObject};
    },
    newAccount(data: { [key: string]: any }): UserAccount {
        return new UserAccount(data.id, data.userId, data.createdAt, data.name, data.roles, data.photoUrl, data.balance, data.settledAt);
    }
};

/**
 * Enumeration of supported user roles
 */
export enum UserRole {
    ADMIN = 'ADMIN'
}

import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {v4 as uuidv4} from 'uuid';
import firebase from 'firebase/app';

require('firebase/firestore'); // Required for accessing Timestamp functions
import TimestampFn = firebase.firestore.Timestamp;

export class GroupInvite {
    inviteLink: string;
    groupName: string;
    groupId: string;
    expiry: Timestamp;

    static generate(groupId: string, groupName: string): GroupInvite {
        const nextWeek = TimestampFn.fromDate(new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)));
        const randomLink = uuidv4().substring(0, 8).toUpperCase();

        return new GroupInvite(randomLink, groupName, groupId, nextWeek);
    }

    constructor(id: string, groupName: string, groupId: string, expiry: Timestamp) {
        this.inviteLink = id;
        this.groupName = groupName;
        this.groupId = groupId;
        this.expiry = expiry;
    }

    get isExpired(): boolean {
        return this.expiry.toMillis() < new Date().getMilliseconds();
    }

    deepCopy(): GroupInvite {
        return JSON.parse(JSON.stringify(this));
    }
}

export const groupInviteConverter: FirestoreDataConverter<GroupInvite> = {
    toFirestore(invite: GroupInvite) {
        return {
            groupName: invite.groupName,
            groupId: invite.groupId,
            expiry: invite.expiry,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): GroupInvite {
        const data = snapshot.data(options);

        return new GroupInvite(snapshot.id, data.groupName, data.groupId, data.expiry);
    },
};

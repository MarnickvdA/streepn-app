import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class GroupInvite {
    id: string;
    groupName: string;
    groupId: string;
    expiry: Timestamp;


    constructor(id: string, groupName: string, groupId: string, expiry: Timestamp) {
        this.id = id;
        this.groupName = groupName;
        this.groupId = groupId;
        this.expiry = expiry;
    }

    get isExpired(): boolean {
        return this.expiry.toMillis() < new Date().getMilliseconds();
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

import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {v4 as uuid} from 'uuid';
import firebase from 'firebase/app';

require('firebase/firestore'); // Required for accessing Timestamp functions
import TimestampFn = firebase.firestore.Timestamp;

export class HouseInvite {
    inviteLink: string;
    houseName: string;
    houseId: string;
    expiry: Timestamp;

    constructor(id: string, houseName: string, houseId: string, expiry: Timestamp) {
        this.inviteLink = id;
        this.houseName = houseName;
        this.houseId = houseId;
        this.expiry = expiry;
    }

    get isExpired(): boolean {
        return this.expiry.toMillis() < new Date().getMilliseconds();
    }

    static generate(houseId: string, houseName: string): HouseInvite {
        const nextWeek = TimestampFn.fromDate(new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)));
        const randomLink = uuid().substring(0, 8).toUpperCase();

        return new HouseInvite(randomLink, houseName, houseId, nextWeek);
    }

    deepCopy(): HouseInvite {
        return JSON.parse(JSON.stringify(this));
    }
}

export const houseInviteConverter: FirestoreDataConverter<HouseInvite> = {
    toFirestore: (invite: HouseInvite) => ({
        houseName: invite.houseName,
        houseId: invite.houseId,
        expiry: invite.expiry,
    }),
    fromFirestore: (snapshot: DocumentSnapshot<any>, options: SnapshotOptions): HouseInvite => {
        const data = snapshot.data(options);

        return new HouseInvite(snapshot.id, data.houseName, data.houseId, data.expiry);
    },
};

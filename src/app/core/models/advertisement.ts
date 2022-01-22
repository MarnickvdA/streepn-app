import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import firebase from 'firebase/app';

require('firebase/firestore'); // Required for accessing Timestamp functions
import TimestampFn = firebase.firestore.Timestamp;

export interface AdvertisementItem {
    priority: number;
    createdAt: Timestamp;
    visibleFrom: Timestamp;
    visibleUntil: Timestamp;
    imageUrl: string;
    header: string;
    subheader: string;
    shortDescription: string;
    description: string;
    cta: string; // Call to Action
    ctaUrl: string;
}

export class Advertisement {
    readonly id: string;
    items: AdvertisementItem[];

    constructor(id: string, items: AdvertisementItem[]) {
        this.id = id;
        this.items = [...items]
            .sort((a, b) => a.priority < b.priority ? 0 : 1)
            .filter((a) =>
                (a.visibleFrom ? a.visibleFrom < TimestampFn.now() : true) &&
                (a.visibleUntil ? a.visibleUntil > TimestampFn.now() : true)
            );
    }
}

export const advertisementConverter: FirestoreDataConverter<Advertisement> = {
    toFirestore: (advertisement: Advertisement) => ({}),
    fromFirestore: (snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Advertisement => {
        const data = snapshot.data(options);
        return newAdvertisement(snapshot.id, data);
    },
};

export const newAdvertisement = (id: string, data: { [key: string]: any }): Advertisement => new Advertisement(id, data.items);

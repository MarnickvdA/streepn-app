import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import firebase from 'firebase/app';

require('firebase/firestore'); // Required for accessing Timestamp functions
import TimestampFn = firebase.firestore.Timestamp;

export interface DealItem {
    id: string;
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
    type: string;
}

export class Deal {
    readonly id: string;
    items: DealItem[];

    constructor(id: string, items: DealItem[]) {
        this.id = id;
        this.items = [...items]
            .sort((a, b) => a.priority < b.priority ? 0 : 1)
            .filter((a) =>
                (a.visibleFrom ? a.visibleFrom < TimestampFn.now() : true) &&
                (a.visibleUntil ? a.visibleUntil > TimestampFn.now() : true)
            );
    }
}

export const dealsConverter: FirestoreDataConverter<Deal> = {
    toFirestore: (deal: Deal) => ({}),
    fromFirestore: (snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Deal => {
        const data = snapshot.data(options);
        return newDeal(snapshot.id, data);
    },
};

export const newDeal = (id: string, data: { [key: string]: any }): Deal => new Deal(id, data.items);

import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export function toDate(t: Timestamp): Date {
    return t.toDate();
}

export function toTimestamp(d: Date): Timestamp {
    return Timestamp.fromDate(d);
}

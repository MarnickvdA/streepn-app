import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export function toDate(t: Timestamp): Date {
    return t.toDate();
}

export function toTimestamp(d: Date): Timestamp {
    return Timestamp.fromDate(d);
}

export function getMoneyString(money: number, locale: string): string {
    return `${(money / 100).toLocaleString('nl-NL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

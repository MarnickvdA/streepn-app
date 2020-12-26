import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export function toDate(t: Timestamp): Date {
    return t.toDate();
}

export function toTimestamp(d: Date): Timestamp {
    return Timestamp.fromDate(d);
}

export function getMoneyString(money: number): string {
    return Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: undefined,
    }).format(money / 100);
}

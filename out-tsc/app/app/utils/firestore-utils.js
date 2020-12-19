import firebase from 'firebase';
var Timestamp = firebase.firestore.Timestamp;
export function toDate(t) {
    return t.toDate();
}
export function toTimestamp(d) {
    return Timestamp.fromDate(d);
}
//# sourceMappingURL=firestore-utils.js.map
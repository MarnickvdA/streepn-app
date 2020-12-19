import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private BASE_URL = environment.baseUrl;

    groupsCollection: AngularFirestoreCollection;

    constructor(private firestore: AngularFirestore) {
        this.groupsCollection = firestore.collection(`${this.BASE_URL}/groups`);
    }
}

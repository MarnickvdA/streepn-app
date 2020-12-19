import {Injectable} from '@angular/core';
import {FirestoreService} from './firestore.service';
import {Product} from '../models';
import firebase from 'firebase/app';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private firestoreService: FirestoreService) {
    }

    addProduct(groupId: string, product: Product) {
        this.firestoreService.groupsCollection.doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayUnion(product)
        });
    }

    removeProduct(groupId: string, product: Product) {
        this.firestoreService.groupsCollection.doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayRemove(product)
        });
    }

}

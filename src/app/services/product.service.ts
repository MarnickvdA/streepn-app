import {Injectable} from '@angular/core';
import {Product} from '../models';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private fs: AngularFirestore) {
    }

    addProduct(groupId: string, product: Product) {
        this.fs.collection('groups').doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayUnion(product)
        });
    }

    removeProduct(groupId: string, product: Product) {
        this.fs.collection('groups').doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayRemove(product)
        });
    }

}

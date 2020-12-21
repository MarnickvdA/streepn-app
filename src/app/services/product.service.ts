import {Injectable} from '@angular/core';
import {Group, Product, productConverter} from '../models';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {v4 as uuidv4} from 'uuid';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private fs: AngularFirestore) {
    }

    editProduct(group: Group, product: Product) {
        group.products = group.products.map(obj => {
            if (obj.id === product.id) {
                return product;
            } else {
                return obj;
            }
        });

        return this.setProducts(group);
    }

    addProduct(group: Group, name: string, price: number) {
        // TODO Add validity checks.

        const product = new Product(uuidv4(), Timestamp.now(), name, price);

        group.products.push(product);

        return this.setProducts(group);
    }

    removeProduct(group: Group, product: Product) {
        group.products = group.products.filter(obj => obj.id !== product.id);

        return this.setProducts(group);
    }

    private setProducts(group: Group): Promise<void> {
        // TODO Clearer would be using Cloud Functions, but money restrictions...
        return this.fs.collection('groups').doc(group.id).set({
            products: group.products.map(p => productConverter.toFirestore(p))
        }, {merge: true});
    }

}

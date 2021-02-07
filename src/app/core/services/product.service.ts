import {Injectable} from '@angular/core';
import {Group, Product, productConverter} from '../models';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private fs: AngularFirestore) {
    }

    addProduct(group: Group, name: string, price: number) {
        const product = Product.new(name, price);

        group.products.push(product);

        const products = group.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('groups').doc(group.id).set({
            products,
            productData: {
                [`${product.id}`]: {
                    amountIn: product.amountIn,
                    amountOut: product.amountOut,
                    totalIn: product.totalIn,
                    totalOut: product.totalOut,
                },
            },
        }, {merge: true});
    }

    editProduct(group: Group, product: Product) {
        group.products = group.products.map(obj => {
            if (obj.id === product.id) {
                return product;
            } else {
                return obj;
            }
        });

        const products = group.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('groups').doc(group.id).set({
            products,
        }, {merge: true});
    }

    removeProduct(group: Group, product: Product) {
        group.products = group.products.filter(obj => obj.id !== product.id);

        const products = group.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('groups').doc(group.id).set({
            products,
            productData: {
                [`${product.id}`]: firebase.firestore.FieldValue.delete()
            },
        }, {merge: true});
    }
}

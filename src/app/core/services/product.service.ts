import {Injectable} from '@angular/core';
import {House, Product, productConverter} from '../models';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private fs: AngularFirestore) {
    }

    addProduct(house: House, name: string, price: number) {
        const product = Product.new(name, price);

        house.products.push(product);

        const products = house.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('houses').doc(house.id).set({
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

    editProduct(house: House, product: Product) {
        house.products = house.products.map(obj => {
            if (obj.id === product.id) {
                return product;
            } else {
                return obj;
            }
        });

        const products = house.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('houses').doc(house.id).set({
            products,
        }, {merge: true});
    }

    removeProduct(house: House, product: Product) {
        house.products = house.products.filter(obj => obj.id !== product.id);

        const products = house.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('houses').doc(house.id).set({
            products,
            productData: {
                [`${product.id}`]: firebase.firestore.FieldValue.delete()
            },
        }, {merge: true});
    }
}

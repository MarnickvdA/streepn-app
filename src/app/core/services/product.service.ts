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

        return this.setProducts(group);
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

    removeProduct(group: Group, product: Product) {
        group.products = group.products.filter(obj => obj.id !== product.id);

        return this.setProducts(group);
    }

    private setProducts(group: Group): Promise<void> {
        const products = group.products.map(p => {
            return productConverter.toFirestore(p);
        });

        return this.fs.collection('groups').doc(group.id).set({
            products
        }, {merge: true});
    }

}

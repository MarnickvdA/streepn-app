import {Injectable} from '@angular/core';
import {House, Product, productConverter} from '../../models';
import firebase from 'firebase/compat/app';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@core/services';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private fs: AngularFirestore,
                private authService: AuthService) {
    }

    addProduct(house: House, name: string, price: number) {
        const product = Product.new(name, price);

        house.products.push(product);

        const products = house.products.map(p => productConverter.toFirestore(p));

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

    editProduct(house: House, product: Product): Promise<void> {
        if (house.isSettling) {
            return Promise.reject('Permission denied: House is being settled');
        }

        const oldProduct = house.getProductById(product.id);
        if (oldProduct.price !== product.price && !this.authService.currentUserIsAdmin(house)) {
            return Promise.reject('Permission denied: User is not administrator');
        }

        house.products = house.products.map(obj => {
            if (obj.id === product.id) {
                return product;
            } else {
                return obj;
            }
        });

        const products = house.products.map(p => productConverter.toFirestore(p));

        return this.fs.collection('houses').doc(house.id).set({
            products,
        }, {merge: true});
    }

    removeProduct(house: House, product: Product) {
        if (house.isSettling) {
            return Promise.reject('Permission denied: House is being settled');
        }

        const oldProduct = house.getProductById(product.id);
        if (oldProduct.price !== product.price && !this.authService.currentUserIsAdmin(house)) {
            return Promise.reject('Permission denied: User is not administrator');
        }

        if (!product.removable) {
            return Promise.reject('Permission denied: Product is not removable');
        }

        house.products = house.products.filter(obj => obj.id !== product.id);
        const products = house.products.map(p => productConverter.toFirestore(p));

        return this.fs.collection('houses').doc(house.id).set({
            products,
            productData: {
                [`${product.id}`]: firebase.firestore.FieldValue.delete()
            },
        }, {merge: true});
    }
}

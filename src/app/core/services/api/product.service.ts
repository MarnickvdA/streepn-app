import {Injectable} from '@angular/core';
import {House, Product, productConverter} from '../../models';
import {AuthService} from '@core/services';
import {deleteField, doc, Firestore, serverTimestamp, setDoc} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private firestore: Firestore,
                private authService: AuthService) {
    }

    addProduct(house: House, name: string, price: number) {
        const product = Product.new(name, price);

        house.products.push(product);

        const products = house.products.map(p => productConverter.toFirestore(p));

        return setDoc(doc(this.firestore, `houses/${house.id}`), {
            products,
            productData: {
                [`${product.id}`]: {
                    amountIn: product.amountIn,
                    amountOut: product.amountOut,
                    totalIn: product.totalIn,
                    totalOut: product.totalOut,
                },
            },
        }, {
            merge: true
        });
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

        return setDoc(doc(this.firestore, `houses/${house.id}`), {
            products,
        }, {
            merge: true
        });
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

        return setDoc(doc(this.firestore, `houses/${house.id}`), {
            products,
            productData: {
                [`${product.id}`]: deleteField
            },
        }, {
            merge: true
        });
    }
}

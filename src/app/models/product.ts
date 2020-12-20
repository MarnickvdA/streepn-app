import {Timestamp} from '@firebase/firestore-types';

export class Product {
    readonly createdAt: Timestamp;
    name: string;
    price: number;


    constructor(createdAt: Timestamp, name: string, price: number) {
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
    }
}

export const productConverter = {
    toFirestore(product: Product) {
        return {
            createdAt: product.createdAt,
            name: product.name,
            price: product.price
        };
    },
    newProduct(data: { [key: string]: any }): Product {
        return new Product(data.createdAt, data.name, data.price);
    }
};

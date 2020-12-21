import {Timestamp} from '@firebase/firestore-types';

export class Product {
    readonly id: string;
    readonly createdAt: Timestamp;
    name: string;
    price: number;


    constructor(id: string, createdAt: Timestamp, name: string, price: number) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
    }
}

export const productConverter = {
    toFirestore(product: Product) {
        return {
            id: product.id,
            createdAt: product.createdAt,
            name: product.name,
            price: product.price
        };
    },
    newProduct(data: { [key: string]: any }): Product {
        return new Product(data.id, data.createdAt, data.name, data.price);
    }
};

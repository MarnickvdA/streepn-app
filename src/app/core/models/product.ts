import {Timestamp} from '@firebase/firestore-types';
import {v4 as uuidv4} from 'uuid';
import firebase from 'firebase/app';
require('firebase/firestore');
import TimestampFn = firebase.firestore.Timestamp;

export class Product {
    id: string;
    createdAt: Timestamp;
    name: string;
    price: number; // Price (currently in cents, since we only support EURO right now.)
    stock?: number; // The current amount of stock available
    totalStock?: number; // The total amount of stock that was deposited for this product
    totalStockWorth?: number; // Total stock worth

    constructor(id: string, createdAt: Timestamp, name: string, price: number, stock?: number,
                totalStock?: number, totalStockWorth?: number) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.totalStock = totalStock;
        this.totalStockWorth = totalStockWorth;
    }

    static new(name: string, price: number) {
        return new Product(uuidv4(), TimestampFn.now(), name, price, undefined);
    }

    deepCopy(): Product {
        return JSON.parse(JSON.stringify(this));
    }
}

export const productConverter = {
    toFirestore(product: Product) {
        const p: any = {
            id: product.id,
            createdAt: product.createdAt,
            name: product.name,
            price: product.price,
        };

        if (!isNaN(product.stock)) {
            p.stock = product.stock;
        }

        if (!isNaN(product.totalStock)) {
            p.totalStock = product.totalStock;
        }

        if (!isNaN(product.totalStockWorth)) {
            p.totalStockWorth = product.totalStockWorth;
        }

        return p;
    },
    newProduct(data: { [key: string]: any }): Product {
        return new Product(data.id, data.createdAt, data.name, data.price, data.stock, data.totalStock, data.totalStockWorth);
    }
};

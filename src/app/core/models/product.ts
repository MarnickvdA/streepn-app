import {v4 as uuid} from 'uuid';
import {getMoneyString} from '@core/utils/formatting-utils';
import {Timestamp} from '@firebase/firestore-types';
import firebase from 'firebase/compat/app';

export class Product {
    id: string;
    createdAt: Timestamp;
    name: string;
    price: number; // Price (currently in cents, since we only support EURO right now.)
    totalIn: number; // Total product worth added to this product
    totalOut: number; // Total product cost
    amountIn: number; // Total stock of this product added
    amountOut: number; // Total stock of this product removed

    constructor(id: string, createdAt: Timestamp, name: string, price: number,
                totalIn: number, totalOut: number, amountIn: number, amountOut: number) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
        this.totalIn = totalIn || 0;
        this.totalOut = totalOut || 0;
        this.amountIn = amountIn || 0;
        this.amountOut = amountOut || 0;
    }

    get stock(): number {
        return this.amountIn - this.amountOut;
    }

    get advisedPrice(): string | undefined {
        return this.amountIn !== 0 ? getMoneyString(this.totalIn / this.amountIn) : undefined;
    }

    get removable(): boolean {
        return this.totalIn === 0 && this.totalOut === 0 && this.amountIn === 0 && this.amountOut === 0;
    }

    /*
     * SETTLEMENT HELPER METHODS
     */
    get currentStockWorth(): number {
        return this.totalIn - this.totalOut;
    }

    get amountLeftPercentage(): number {
        return this.amountIn !== 0 ? 1 - this.amountOut / this.amountIn : 0;
    }

    get maxRevenue(): number {
        return this.stock * this.price;
    }

    get worthDifference(): number {
        return this.currentStockWorth - this.maxRevenue;
    }

    get restWorth(): number {
        return Math.round((this.worthDifference * this.amountLeftPercentage) + this.maxRevenue);
    }

    static new(name: string, price: number) {
        return new Product(uuid(), firebase.firestore.Timestamp.now(), name, price, 0, 0, 0, 0);
    }

    deepCopy(): Product {
        return JSON.parse(JSON.stringify(this));
    }
}

export const productConverter = {
    toFirestore: (product: Product) => {
        const p: any = {
            id: product.id,
            createdAt: product.createdAt,
            name: product.name,
            price: product.price,
        };

        return p;
    },
    newProduct: (data: { [key: string]: any }): Product => new Product(data.id, data.createdAt, data.name, data.price,
        data.totalIn, data.totalOut, data.amountIn, data.amountOut)
};

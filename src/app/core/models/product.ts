import {Timestamp} from '@firebase/firestore-types';
import {getMoneyString} from '@core/utils/firestore-utils';

export class Product {
    id: string;
    createdAt: Timestamp;
    name: string;
    price: number;
    stock?: number;

    constructor(id: string, createdAt: Timestamp, name: string, price: number, stock?: number) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    get priceString(): string {
        return getMoneyString(this.price);
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

        return p;
    },
    newProduct(data: { [key: string]: any }): Product {
        return new Product(data.id, data.createdAt, data.name, data.price, data.stock);
    }
};

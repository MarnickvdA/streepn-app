import {Timestamp} from '@firebase/firestore-types';

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

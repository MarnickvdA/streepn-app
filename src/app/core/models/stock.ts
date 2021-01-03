import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {UserAccount, userAccountConverter} from './account';
import {Product, productConverter} from './product';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class Stock {
    id: string;
    createdAt: Timestamp;
    createdBy: UserAccount;
    product: Product;
    cost: number;
    amount: number;
    removed: boolean;


    constructor(id: string, createdAt: Timestamp, createdBy: UserAccount, product: Product,
                cost: number, amount: number, removed: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.product = product;
        this.cost = cost;
        this.amount = amount;
        this.removed = removed;
    }
}

export const stockConverter: FirestoreDataConverter<Stock> = {
    toFirestore(stock: Stock) {
        return {
            createdAt: stock.createdAt,
            createdBy: userAccountConverter.toFirestore(stock.createdBy),
            product: productConverter.toFirestore(stock.product),
            cost: stock.cost,
            amount: stock.amount,
            removed: stock.removed,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Stock {
        const data = snapshot.data(options);

        return newStock(snapshot.id, data);
    },
};

export function newStock(id: string, data: { [key: string]: any }): Stock {
    return new Stock(id, data.createdAt as Timestamp, userAccountConverter.newAccount(data.createdBy),
        productConverter.newProduct(data.product), data.cost, data.amount, data.removed);
}

import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class Stock {
    id: string;
    createdAt: Timestamp;
    createdBy: string;
    paidBy: string[];
    paidAmount: number[];
    productId: string;
    cost: number;
    amount: number;
    removed: boolean;


    constructor(id: string, createdAt: Timestamp, createdById: string, paidBy: string[], paidAmount: number[], productId: string,
                cost: number, amount: number, removed: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdById;
        this.paidBy = paidBy;
        this.paidAmount = paidAmount;
        this.productId = productId;
        this.cost = cost;
        this.amount = amount;
        this.removed = removed;
    }
}

export const stockConverter: FirestoreDataConverter<Stock> = {
    toFirestore(stock: Stock) {
        return {
            createdAt: stock.createdAt,
            createdBy: stock.createdBy,
            paidBy: stock.paidBy,
            product: stock.productId,
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
    return new Stock(id, data.createdAt as Timestamp, data.createdBy, data.paidBy, data.paidAmount, data.productId, data.cost, data.amount,
        data.removed);
}

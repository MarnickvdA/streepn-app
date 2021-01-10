import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';

export interface TransactionItem {
    amount: number;
    accountId: string;
    productId: string;
    productPrice: number;
}

export class Transaction {
    readonly id: string;
    createdAt: Timestamp;
    createdBy: string;
    totalPrice: number;
    itemCount: number;
    items: TransactionItem[];
    removed: boolean;

    constructor(id: string, createdAt: Timestamp, createdBy: string, totalPrice: number, itemCount: number,
                items: TransactionItem[], removed: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.totalPrice = totalPrice;
        this.itemCount = itemCount;
        this.items = [...items];
        this.removed = removed || false;
    }
}

export const transactionConverter: FirestoreDataConverter<Transaction> = {
    toFirestore(transaction: Transaction) {
        return {
            createdAt: transaction.createdAt,
            createdBy: transaction.createdBy,
            totalPrice: transaction.totalPrice,
            itemCount: transaction.items.length,
            items: transaction.items,
            removed: transaction.removed,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Transaction {
        const data = snapshot.data(options);

        return newTransaction(snapshot.id, data);
    },
};

export function newTransaction(id: string, data: { [key: string]: any }): Transaction {
    return new Transaction(id, data.createdAt as Timestamp, data.createdBy, data.totalPrice,
        data.itemCount, data.items, data.removed);
}

import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';

export interface TransactionItem {
    productId: string; // Id of bought product
    productPrice: number; // Price of the product at the moment of buying (in cents)
    amount: number; // Amount of productId bought
    accountId: string; // Account whom bought this product at the described price and amount.
}

export class Transaction {
    readonly id: string;
    createdAt: Timestamp;
    createdBy: string;
    totalPrice: number; // Price of all TransactionItems combined
    itemCount: number; // Count of TransactionItems (NOT amount of products sold)
    items: TransactionItem[];
    removed: boolean;

    private priceDictionary: {
        [accountId: string]: number;
    } = {};

    constructor(id: string, createdAt: Timestamp, createdBy: string, totalPrice: number, itemCount: number,
                items: TransactionItem[], removed: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.totalPrice = totalPrice;
        this.itemCount = itemCount;
        this.items = [...items];
        this.removed = removed || false;

        this.items.forEach((item) => {
            if (!this.priceDictionary[item.accountId]) {
                this.priceDictionary[item.accountId] = 0;
            }

            this.priceDictionary[item.accountId] -= item.productPrice * item.amount;
        });
    }

    priceByAccountId(accountId: string): number {
        const price = this.priceDictionary[accountId];

        return price < 0 ? price : undefined;
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
        data.itemCount, JSON.parse(JSON.stringify(data.items)), data.removed);
}

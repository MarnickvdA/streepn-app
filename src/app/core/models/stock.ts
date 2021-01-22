import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Group} from '@core/models/group';

export class Stock {
    id: string;
    createdAt: Timestamp;
    createdBy: string; // accountId
    paidBy: string[]; // TODO Change to map with key as accountId and value as paidAmount
    paidAmount: number[];
    productId: string;
    cost: number; // Costs of this stock transaction. Currently in cents.
    amount: number; // Amount of items of productId added.
    removed: boolean; // Describes if the stock transaction was removed (after editing: all items removed)
    writtenOff: boolean; // TODO Add documentation what 'writtenOff' means.

    static new(id: string, paidBy: string[], paidAmount: number[], productId: string, cost: number, amount: number) {
        return new Stock(undefined, undefined, id, paidBy, paidAmount, productId, cost, amount, false, false);
    }

    constructor(id: string, createdAt: Timestamp, createdById: string, paidBy: string[], paidAmount: number[], productId: string,
                cost: number, amount: number, removed: boolean, writtenOff: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdById;
        this.paidBy = paidBy;
        this.paidAmount = paidAmount;
        this.productId = productId;
        this.cost = cost;
        this.amount = amount;
        this.removed = removed || false;
        this.writtenOff = writtenOff || false;
    }

    /**
     * Check if the stock can be edited.
     */
    get isMutable(): boolean {
        return !this.removed && !this.writtenOff;
    }

    paidByString(group: Group) {
        return this.paidBy.map(account => group.getUserAccountById(account)?.name).join(', ');
    }

    deepCopy(): Stock {
        return JSON.parse(JSON.stringify(this));
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
            writtenOff: stock.writtenOff,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Stock {
        const data = snapshot.data(options);

        return newStock(snapshot.id, data);
    },
};

export function newStock(id: string, data: { [key: string]: any }): Stock {
    return new Stock(id, data.createdAt as Timestamp, data.createdBy, data.paidBy, data.paidAmount, data.productId, data.cost, data.amount,
        data.removed, data.writtenOff);
}

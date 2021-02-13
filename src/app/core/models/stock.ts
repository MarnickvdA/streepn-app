import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {House} from '@core/models/house';

export class Stock {
    id: string;
    createdAt: Timestamp;
    createdBy: string; // accountId
    paidById: string;
    productId: string;
    cost: number; // Costs of this stock transaction. Currently in cents.
    amount: number; // Amount of items of productId added.
    removed: boolean; // Describes if the stock transaction was removed (after editing: all items removed)
    writtenOff: boolean; // TODO Add documentation what 'writtenOff' means.

    static new(id: string, paidById: string, productId: string, cost: number, amount: number) {
        return new Stock(undefined, undefined, id, paidById, productId, cost, amount, false, false);
    }

    constructor(id: string, createdAt: Timestamp, createdById: string, paidById: string,
                productId: string, cost: number, amount: number, removed: boolean, writtenOff: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdById;
        this.paidById = paidById;
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

    paidByString(house: House) {
        return house.getUserAccountById(this.paidById)?.name;
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
            paidById: stock.paidById,
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
    return new Stock(id, data.createdAt as Timestamp, data.createdBy, data.paidById, data.productId, data.cost, data.amount,
        data.removed, data.writtenOff);
}

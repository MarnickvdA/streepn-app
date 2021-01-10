import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {Account, accountConverter, sharedAccountConverter, UserAccount, userAccountConverter} from './account';
import {Product, productConverter} from './product';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class Stock {
    id: string;
    createdAt: Timestamp;
    createdBy: UserAccount;
    paidBy: Account[];
    product: Product;
    cost: number;
    amount: number;
    removed: boolean;


    constructor(id: string, createdAt: Timestamp, createdBy: UserAccount, paidBy: Account[], product: Product,
                cost: number, amount: number, removed: boolean) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.paidBy = paidBy;
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
            paidBy: stock.paidBy.map(acc => accountConverter.toFirestore(acc)),
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
        data.paidBy?.map(acc => {
            switch (acc.type) {
                case 'user':
                    return userAccountConverter.newAccount(acc);
                case 'shared':
                    return sharedAccountConverter.newSharedAccount(acc);
            }
        }),
        productConverter.newProduct(data.product), data.cost, data.amount, data.removed);
}

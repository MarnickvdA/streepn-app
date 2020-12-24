import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {Product, productConverter} from './product';
import {Account, accountConverter} from './account';

export class Transaction {
    readonly id: string;
    createdAt: Timestamp;
    amount: number;
    totalPrice: number;
    createdBy: string;
    createdById: string;
    account: Account;
    product: Product;


    constructor(id: string, createdAt: Timestamp, amount: number, totalPrice: number, createdBy: string,
                createdById: string, account: Account, product: Product) {
        this.id = id;
        this.createdAt = createdAt;
        this.amount = amount;
        this.totalPrice = totalPrice;
        this.createdBy = createdBy;
        this.createdById = createdById;
        this.account = account;
        this.product = product;
    }
}

export const transactionConverter: FirestoreDataConverter<Transaction> = {
    toFirestore(transaction: Transaction) {
        if (transaction.account) {
            return {
                createdAt: transaction.createdAt,
                amount: transaction.amount,
                totalPrice: transaction.totalPrice,
                createdBy: transaction.createdBy,
                createdById: transaction.createdById,
                account: accountConverter.toFirestore(transaction.account),
                product: productConverter.toFirestore(transaction.product)
            };
        }
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Transaction {
        const data = snapshot.data(options);

        return newTransaction(snapshot.id, data);
    },
};

export function newTransaction(id: string, data: { [key: string]: any }): Transaction {
    return new Transaction(id, data.createdAt as Timestamp, data.amount, data.totalPrice, data.createdBy,
        data.createdById, data.account, productConverter.newProduct(data.product));
}

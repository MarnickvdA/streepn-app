import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {Product, productConverter} from './product';
import {Account, accountConverter, sharedAccountConverter, UserAccount, userAccountConverter} from './account';

export interface TransactionItem {
    amount: number;
    account: Account;
    product: Product;
}

export class Transaction {
    readonly id: string;
    createdAt: Timestamp;
    createdBy: UserAccount;
    totalPrice: number;
    itemCount: number;
    items: TransactionItem[];
    removed: boolean;

    constructor(id: string, createdAt: Timestamp, createdBy: UserAccount, totalPrice: number, itemCount: number,
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
            createdBy: userAccountConverter.toFirestore(transaction.createdBy),
            totalPrice: transaction.totalPrice,
            itemCount: transaction.items.length,
            items: transaction.items.map(ti => {
                ti.account = accountConverter.toFirestore(ti.account);
                ti.product = productConverter.toFirestore(ti.product);
                return ti;
            }),
            removed: transaction.removed,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Transaction {
        const data = snapshot.data(options);

        return newTransaction(snapshot.id, data);
    },
};

export function newTransaction(id: string, data: { [key: string]: any }): Transaction {
    return new Transaction(id, data.createdAt as Timestamp, userAccountConverter.newAccount(data.createdBy), data.totalPrice,
        data.itemCount, data.items.map(item => {

            switch (item.account.type) {
                case 'user':
                    item.account = userAccountConverter.newAccount(item.account);
                    break;
                case 'shared':
                    item.account = sharedAccountConverter.newSharedAccount(item.account);
                    break;
            }

            return {
                amount: item.amount,
                account: item.account,
                product: productConverter.newProduct(item.product),
            };
        }), data.removed);
}

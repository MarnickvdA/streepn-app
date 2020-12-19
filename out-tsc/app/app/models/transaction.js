import { accountConverter, productConverter } from './index';
export class Transaction {
    constructor(id, createdAt, amount, totalPrice, createdBy, createdById, account, product) {
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
export const transactionConverter = {
    toFirestore(transaction) {
        return {
            createdAt: transaction.createdAt,
            amount: transaction.amount,
            totalPrice: transaction.totalPrice,
            createdBy: transaction.createdBy,
            createdById: transaction.createdById,
            account: accountConverter.toFirestore(transaction.account),
            product: productConverter.toFirestore(transaction.product)
        };
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return new Transaction(snapshot.id, data.createdAt.toDate(), data.amount, data.totalPrice, data.createdBy, data.createdById, accountConverter.newAccount(0, data.account), productConverter.newProduct(0, data.product));
    }
};
//# sourceMappingURL=transaction.js.map
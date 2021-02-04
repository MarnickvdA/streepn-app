import {Stock} from '../models';
import * as admin from 'firebase-admin';

export function getGroupUpdateData(stock: Stock) {
    return {
        totalIn: admin.firestore.FieldValue.increment(stock.cost),
        [`productData.${stock.productId}.totalIn`]: admin.firestore.FieldValue.increment(stock.cost),
        [`productData.${stock.productId}.amountIn`]: admin.firestore.FieldValue.increment(stock.amount),
        [`balances.${stock.paidById}.totalIn`]: admin.firestore.FieldValue.increment(stock.cost),
        [`balances.${stock.paidById}.products.${stock.productId}.totalIn`]:
            admin.firestore.FieldValue.increment(stock.cost),
        [`balances.${stock.paidById}.products.${stock.productId}.amountIn`]:
            admin.firestore.FieldValue.increment(stock.amount),
    };
}

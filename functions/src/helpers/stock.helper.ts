import {Stock} from '../models';
import * as admin from 'firebase-admin';

export function getDeltaStock(originalStock: Stock, updatedStock: Stock) {
    return {
        id: originalStock.id,
        createdAt: originalStock.createdAt,
        createdBy: originalStock.createdBy,
        paidById: originalStock.paidById,
        productId: originalStock.productId,
        cost: originalStock.paidById !== updatedStock.paidById ? -originalStock.cost : updatedStock.cost - originalStock.cost,
        amount: originalStock.productId !== updatedStock.productId ? -originalStock.amount : updatedStock.amount - originalStock.amount,
    } as Stock;
}

export function getGroupUpdateDataIn(stock: Stock) {
    return getGroupUpdateData(stock, 'In');
}

export function getGroupUpdateDataOut(stock: Stock) {
    return getGroupUpdateData(stock, 'Out');
}

function getGroupUpdateData(stock: Stock, direction: 'In' | 'Out') {
    return {
        totalIn: admin.firestore.FieldValue.increment(stock.cost),
        [`productData.${stock.productId}.total${direction}`]: admin.firestore.FieldValue.increment(stock.cost),
        [`productData.${stock.productId}.amount${direction}`]: admin.firestore.FieldValue.increment(stock.amount),
        [`balances.${stock.paidById}.total${direction}`]: admin.firestore.FieldValue.increment(stock.cost),
        [`balances.${stock.paidById}.products.${stock.productId}.total${direction}`]:
            admin.firestore.FieldValue.increment(stock.cost),
        [`balances.${stock.paidById}.products.${stock.productId}.amount${direction}`]:
            admin.firestore.FieldValue.increment(stock.amount),
    };
}

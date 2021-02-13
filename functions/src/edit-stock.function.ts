import {Group, Stock} from './models';
import * as functions from 'firebase-functions';
import {ErrorMessage} from './models/error-message';
import {getDeltaStock, getGroupUpdateDataIn} from './helpers/stock.helper';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface EditStockData {
    groupId: string;
    updatedStock: Stock;
}

/**
 * editStock
 *
 * HTTP Trigger function for editing an existing Stock object
 *
 * @var groupId: string
 * @var updatedStock: Updated state of the existing Stock Object
 * @var deltaStock: Difference between the old Stock and the new Stock object
 *
 * @returns edited Stock
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws PRODUCT_NOT_FOUND if the product provided in the stock object was not found in this group
 */
export const editStock = functions.region('europe-west1').https.onCall((data: EditStockData, context) => {

    const userId: string | undefined = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
    }

    if (!data.groupId || !data.updatedStock) {
        throw new functions.https.HttpsError('failed-precondition', ErrorMessage.INVALID_DATA);
    }

    const groupRef = db.collection('groups').doc(data.groupId);

    return db.runTransaction(fireTrans => {
        return fireTrans.get(groupRef)
            .then(groupDoc => {
                const group: Group = groupDoc?.data() as Group;

                // Check if the group exists
                if (!groupDoc.exists || !group) {
                    throw new functions.https.HttpsError('not-found', 'No such group document!');
                }

                // Check if the user is part of this group
                if (!group.members.includes(userId)) {
                    throw new functions.https.HttpsError('permission-denied', 'User not member of group');
                }

                return fireTrans.get(groupRef.collection('stock').doc(data.updatedStock.id))
                    .then(originalDoc => {
                        const original: Stock = originalDoc?.data() as Stock;

                        // Check if the group exists
                        if (!originalDoc.exists || !original) {
                            throw new functions.https.HttpsError('not-found', 'No such stock document!');
                        }

                        const deltaStock: Stock = getDeltaStock(original, data.updatedStock);

                        // Update old stock and update stock in firestore
                        if (data.updatedStock.amount === 0) {
                            fireTrans.update(groupRef.collection('stock').doc(data.updatedStock.id), {
                                removed: true,
                            });
                        } else {
                            fireTrans.update(groupRef.collection('stock').doc(data.updatedStock.id), {
                                paidById: data.updatedStock.paidById,
                                cost: data.updatedStock.cost,
                                amount: data.updatedStock.amount,
                                productId: data.updatedStock.productId,
                            });
                        }

                        const groupUpdate: any = getGroupUpdateDataIn(deltaStock);

                        if (data.updatedStock.productId !== deltaStock.productId) {
                            groupUpdate[`productData.${data.updatedStock.productId}.totalIn`]
                                = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                            groupUpdate[`productData.${data.updatedStock.productId}.amountIn`]
                                = admin.firestore.FieldValue.increment(data.updatedStock.amount);
                            groupUpdate[`balances.${data.updatedStock.paidById}.totalIn`]
                                = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                            groupUpdate[`balances.${data.updatedStock.paidById}.products.${data.updatedStock.productId}.totalIn`]
                                = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                            groupUpdate[`balances.${data.updatedStock.paidById}.products.${data.updatedStock.productId}.amountIn`]
                                = admin.firestore.FieldValue.increment(data.updatedStock.amount);
                        }

                        fireTrans.update(groupRef, groupUpdate);

                        return data.updatedStock;
                    });
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', ErrorMessage.INTERNAL);
            });
    });
});

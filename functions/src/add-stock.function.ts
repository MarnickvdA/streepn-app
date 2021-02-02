import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {Group, Product, Stock} from './models';
import {ErrorMessage} from './models/error-message';
import {getGroupUpdateData} from './helpers/stock.helper';

const {v4: uuidv4} = require('uuid');
const db = admin.firestore();

interface AddStockData {
    groupId: string;
    stock: Stock;
}

/**
 * addStock
 *
 * HTTP Trigger function for adding a stock item to a group
 *
 * @var groupId: string
 * @var stock: Stock Object
 *
 * @returns added Stock
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws PRODUCT_NOT_FOUND if the product provided in the stock object was not found in this group
 */
export const addStock = functions.region('europe-west1').https.onCall((data: AddStockData, context) => {

    const userId: string | undefined = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
    }

    if (!data.groupId || !data.stock) {
        throw new functions.https.HttpsError('failed-precondition', ErrorMessage.INVALID_DATA);
    }

    const groupRef = db.collection('groups').doc(data.groupId);

    return db.runTransaction(fireTrans => {
        return fireTrans.get(groupRef)
            .then(groupDoc => {
                const group: Group = groupDoc.data() as Group;

                // Check if the group exists
                if (!groupDoc.exists || !group) {
                    throw new functions.https.HttpsError('not-found', ErrorMessage.GROUP_NOT_FOUND);
                }

                // Check if the user is part of this group
                if (!group.members.includes(userId)) {
                    throw new functions.https.HttpsError('permission-denied', ErrorMessage.NOT_MEMBER_OF_GROUP);
                }

                const currentProduct: Product | undefined = group.products.find((product: Product) => product.id === data.stock.productId);

                if (!currentProduct) {
                    throw new functions.https.HttpsError('not-found', ErrorMessage.PRODUCT_NOT_FOUND);
                }

                const uid: string = uuidv4();
                const newStock: Stock = {
                    id: uid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    createdBy: data.stock.createdBy,
                    paidById: data.stock.paidById,
                    productId: data.stock.productId,
                    cost: data.stock.cost,
                    amount: data.stock.amount,
                };

                // Add the transaction to firestore
                fireTrans.set(groupRef.collection('stock').doc(uid), newStock);

                fireTrans.update(groupRef, getGroupUpdateData(data.stock));

                return newStock;
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', ErrorMessage.INTERNAL);
            });
    });
});

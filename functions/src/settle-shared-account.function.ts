import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ErrorMessage} from './models/error-message';
import {Group, SharedAccount} from './models';
const db = admin.firestore();

interface AccountsPayout {
    [accountId: string]: Payout;
}

interface Payout {
    totalOut: number;
    products: {
        [productId: string]: {
            totalOut: number,
            amountOut: number,
        };
    };
}

interface SettleSharedAccountData {
    groupId: string;
    sharedAccountId: string;
    settlement: AccountsPayout;
}

/**
 * settleSharedAccount
 *
 * HTTP Trigger function for editing an existing transaction and use atomic operations for updating the balances of accounts and updating
 * product data.
 *
 * @var groupId: string
 * @var updatedTransaction: Transaction Object
 * @var deltaTransaction: Transaction Object
 *
 * @returns void
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws USER_ACCOUNT_NOT_FOUND if the account of the user was not found in this group
 */
export const settleSharedAccount = functions.region('europe-west1').https
    .onCall((data: SettleSharedAccountData, context) => {

        const userId: string | undefined = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
        }

        if (!data.groupId || !data.sharedAccountId || !data.settlement) {
            throw new functions.https.HttpsError('failed-precondition', ErrorMessage.INVALID_DATA);
        }

        const groupRef = db.collection('groups').doc(data.groupId);
        return db.runTransaction(fireTrans => {
            return fireTrans.get(groupRef)
                .then(groupDoc => {
                    const group: Group = groupDoc?.data() as Group;

                    // Check if the group exists
                    if (!groupDoc.exists || !group) {
                        throw new functions.https.HttpsError('not-found', ErrorMessage.GROUP_NOT_FOUND);
                    }

                    // Check if the user is part of this group
                    if (!group.members.includes(userId)) {
                        throw new functions.https.HttpsError('permission-denied', ErrorMessage.NOT_MEMBER_OF_GROUP);
                    }

                    // Check if the shared account is part of this group
                    if (!group.sharedAccounts.find((acc: SharedAccount) => acc.id === data.sharedAccountId)) {
                        throw new functions.https.HttpsError('not-found', ErrorMessage.SHARED_ACCOUNT_NOT_FOUND);
                    }

                    // Create an update object
                    const updateObject: {
                        [key: string]: unknown,
                    } = {
                        [`balances.${data.sharedAccountId}.totalIn`]: 0,
                        [`balances.${data.sharedAccountId}.totalOut`]: 0,
                        [`balances.${data.sharedAccountId}.products`]: {},
                        sharedAccounts: group.sharedAccounts.map((acc: SharedAccount) => {
                            if (acc.id === data.sharedAccountId) {
                                acc.settledAt = admin.firestore.Timestamp.now();
                            }

                            return acc;
                        }),
                    };

                    Object.keys(data.settlement).forEach((accountId: string) => {
                        const payer: Payout = data.settlement[accountId];

                        updateObject[`balances.${accountId}.totalOut`] = admin.firestore.FieldValue.increment(payer.totalOut);

                        Object.keys(payer.products)
                            .forEach((productId: string) => {
                                updateObject[`balances.${accountId}.products.${productId}.totalOut`]
                                    = admin.firestore.FieldValue.increment(payer.products[productId].totalOut);
                                updateObject[`balances.${accountId}.products.${productId}.amountOut`]
                                    = admin.firestore.FieldValue.increment(payer.products[productId].amountOut);
                            });
                    });

                    // Update the group
                    fireTrans.update(groupRef, updateObject);
                })
                .catch(err => {
                    console.error(err);
                    throw new functions.https.HttpsError('internal', ErrorMessage.INTERNAL);
                });
        });
    });

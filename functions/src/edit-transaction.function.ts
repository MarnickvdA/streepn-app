import {Group, Transaction, UserAccount} from './models';
import * as functions from 'firebase-functions';
import {ErrorMessage} from './models/error-message';
import {getTransactionUpdateObject} from './helpers/transaction.helper';
import * as admin from 'firebase-admin';
const db = admin.firestore();

interface EditTransactionData {
    groupId: string;
    updatedTransaction: Transaction;
    deltaTransaction: Transaction;
}

/**
 * editTransaction
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
export const editTransaction = functions.region('europe-west1').https
    .onCall((data: EditTransactionData, context) => {

        const userId: string | undefined = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
        }

        if (!data.groupId || !data.updatedTransaction || !data.deltaTransaction) {
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

                    const currentAccount: UserAccount | undefined
                        = group.accounts.find((account: any) => account.userId === context.auth?.uid);

                    if (!currentAccount) {
                        throw new functions.https.HttpsError('not-found', ErrorMessage.USER_ACCOUNT_NOT_FOUND);
                    }

                    // Update old transaction and add new transaction to firestore
                    if (data.updatedTransaction.items.length === 0) {
                        fireTrans.update(groupRef.collection('transactions').doc(data.updatedTransaction.id), {
                            removed: true,
                        });
                    } else {
                        fireTrans.update(groupRef.collection('transactions').doc(data.updatedTransaction.id), {
                            items: data.updatedTransaction.items,
                        });
                    }

                    // Update the balance of the accounts
                    fireTrans.update(groupRef, getTransactionUpdateObject(group, data.deltaTransaction));
                })
                .catch(err => {
                    console.error(err);
                    throw new functions.https.HttpsError('internal', ErrorMessage.INTERNAL);
                });
        });
    });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ErrorMessage} from './models/error-message';
import {Group, Transaction, UserAccount} from './models';
import {getTransactionUpdateObject} from './helpers/transaction.helper';

const {v4: uuidv4} = require('uuid');
const db = admin.firestore();

interface AddTransactionData {
    groupId: string;
    transaction: Transaction;
}

/**
 * addTransaction
 *
 * HTTP Trigger function for adding a new transaction and use atomic operations for increasing the balances of accounts and reducing
 * product data.
 *
 * @var groupId: string
 * @var transaction: Transaction Object
 *
 * @returns void
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws USER_ACCOUNT_NOT_FOUND if the account of the user was not found in this group
 */
export const addTransaction = functions.region('europe-west1').https
    .onCall((data: AddTransactionData, context) => {

        const userId: string | undefined = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
        }

        if (!data.groupId || !data.transaction) {
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

                    const newTransaction = {
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: currentAccount.id,
                        items: data.transaction.items,
                        removed: false,
                    };

                    // Add the transaction to firestore
                    fireTrans.set(groupRef.collection('transactions').doc(uuidv4()), newTransaction);

                    // Update the balance of the accounts
                    fireTrans.update(groupRef, getTransactionUpdateObject(group, data.transaction));
                })
                .catch(err => {
                    console.error(err);
                    throw new functions.https.HttpsError('internal', ErrorMessage.INTERNAL);
                });
        });
    });


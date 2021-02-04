import * as functions from 'firebase-functions';
import {ErrorMessage} from './models/error-message';
import * as admin from 'firebase-admin';
import {Group, Settlement} from './models';
import {AccountBalanceMap, calculateNewBalance, calculateSettlement, deriveUpdateBatch} from './helpers/settlement.helper';

const {v4: uuidv4} = require('uuid');
const db = admin.firestore();

export interface SettleGroupData {
    groupId: string;
}

/**
 * settleGroup
 *
 * HTTP Trigger function for settling a group
 *
 * @var groupId: string
 *
 * @returns void
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws USER_ACCOUNT_NOT_FOUND if the account of the user was not found in this group
 * @throws SHARED_ACCOUNT_NOT_FOUND if the shared account with accountId was not found in this group
 * @throws PRODUCT_NOT_FOUND if the product with productId was not found in this group
 */
export const settleGroup = functions.region('europe-west1').https
    .onCall((data: SettleGroupData, context) => {

        const userId: string | undefined = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', ErrorMessage.UNAUTHENTICATED);
        }

        if (!data.groupId) {
            throw new functions.https.HttpsError('failed-precondition', ErrorMessage.INVALID_DATA);
        }

        const groupRef = db.collection('groups').doc(data.groupId);

        groupRef.set({
                isSettling: true,
                settleTimeout: admin.firestore.Timestamp.now(),
            }, {merge: true})
            .catch(err => {
                console.error(err);
            });

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

                    const newAccountBalances: AccountBalanceMap = calculateNewBalance(group);

                    const updateBatch: any = deriveUpdateBatch(group, newAccountBalances);
                    const settlement: Settlement = calculateSettlement(group, userId, newAccountBalances);

                    fireTrans.update(groupRef, updateBatch);
                    fireTrans.create(groupRef.collection('settlements').doc(uuidv4()), settlement);
                })
                .catch((err: any) => {
                    groupRef.set({
                            isSettling: true,
                            settleTimeout: admin.firestore.Timestamp.now(),
                        }, {merge: true})
                        .catch(error => {
                            console.error(error);
                        });

                    console.error(err);
                    throw new functions.https.HttpsError('internal', ErrorMessage.INTERNAL);
                });
        });
    });

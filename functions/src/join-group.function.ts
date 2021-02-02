import {AuthUser, Balance, Group, UserAccount} from './models';
import {ErrorMessage} from './models/error-message';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const {v4: uuidv4} = require('uuid');
const db = admin.firestore();

interface JoinGroupData {
    groupId: string;
    user: AuthUser;
    inviteLink: string;
}

/**
 * joinGroup
 *
 * HTTP Trigger function when a user wants to join a group. This function will cross-check the groupCodes collection with the group using
 * this code to see if the groupCode is valid and not expired.
 *
 * @var groupId: string
 * @var user: Firebase User object
 * @var inviteLink: string - Invite code for the group
 *
 * @returns added UserAccount
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INVALID_DATA if the data provided in the call was incomplete
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws INVALID_GROUP_CODE if the group code was not found in the group object
 * @throws EXPIRED_GROUP_CODE if the group code used in the call is expired
 */
export const joinGroup = functions.region('europe-west1').https.onCall((data: JoinGroupData, context) => {

    const userId: string | undefined = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
    }

    if (!data.groupId || !data.user || data.inviteLink) {
        throw new functions.https.HttpsError('failed-precondition', ErrorMessage.INVALID_DATA);
    }

    const user: AuthUser = data.user;

    const groupRef = db.collection('groups').doc(data.groupId);

    return db.runTransaction(fireTrans => {
        return fireTrans.get(groupRef)
            .then(groupDoc => {
                const group: Group = groupDoc.data() as Group;

                // Check if the group exists
                if (!groupDoc.exists || !group) {
                    throw new functions.https.HttpsError('not-found', ErrorMessage.GROUP_NOT_FOUND);
                }

                // Check if the inviteLink is linked to the group, protecting the group from forged group invites
                if (group.inviteLink !== data.inviteLink) {
                    throw new functions.https.HttpsError('permission-denied', ErrorMessage.INVALID_GROUP_CODE);
                }

                const now = admin.firestore.Timestamp.now();
                if (group.inviteLinkExpiry < now) {
                    throw new functions.https.HttpsError('permission-denied', ErrorMessage.EXPIRED_GROUP_CODE);
                }

                const accountId = uuidv4();
                const account: UserAccount = {
                    id: accountId,
                    name: user.displayName,
                    photoUrl: user.photoURL,
                    roles: group.accounts.length === 0 ? ['ADMIN'] : [],
                    userId,
                    createdAt: now,
                    type: 'user',
                };

                const accountBalance: Balance = {
                    totalIn: 0,
                    totalOut: 0,
                };

                fireTrans.update(groupRef, {
                    accounts: admin.firestore.FieldValue.arrayUnion(account),
                    members: admin.firestore.FieldValue.arrayUnion(userId),
                    [`balances.${accountId}`]: accountBalance,
                });

                return account;
            })
            .catch((err: any) => {
                console.error(err);
                throw new functions.https.HttpsError('internal', ErrorMessage.INTERNAL);
            });
    });
});


import * as functions from 'firebase-functions';
import {ErrorMessage} from './models/error-message';
import {Balance, Group, UserAccount} from './models';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface LeaveGroupData {
    groupId: string;
}

/**
 * leaveGroup
 *
 * HTTP Trigger function when a user account issues to leave a group
 *
 * @var groupId: string
 *
 * @returns deleted UserAccount
 * @throws UNAUTHENTICATED if the initiator of this call is not authenticated with Firebase Auth
 * @throws PERMISSION_DENIED if this user is not allowed to do operations
 * @throws INVALID_DATA if the data provided in the call was incomplete
 * @throws INTERNAL if something went wrong which we cannot completely explain
 * @throws GROUP_NOT_FOUND if the group with variable groupId was not found
 * @throws NOT_MEMBER_OF_GROUP if the user is not member of this group
 * @throws USER_ACCOUNT_NOT_FOUND if the user account for the authenticated user was not found
 * @throws GROUP_LEAVE_DENIED if the user has not met the criteria for a group leave
 */
export const leaveGroup = functions.region('europe-west1').https.onCall((data: LeaveGroupData, context) => {

    const userId: string | undefined = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
    }

    if (!data.groupId) {
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

                const account: UserAccount | undefined = group.accounts.find((acc: UserAccount) => acc.userId === context.auth?.uid);

                if (group.members.length > 1) {
                    if (!account) {
                        throw new functions.https.HttpsError('not-found', ErrorMessage.USER_ACCOUNT_NOT_FOUND);
                    }

                    const accountBalance: Balance | undefined = group.balances[account.id];

                    // Check if the current user is allowed to leave
                    // TODO Check if this check is complete. Maybe ignoring the products without a price.
                    if (!accountBalance || accountBalance?.totalIn !== 0 || accountBalance?.totalOut !== 0) {
                        throw new functions.https.HttpsError('permission-denied', ErrorMessage.GROUP_LEAVE_DENIED);
                    }

                    // Remove the balance of this account from the map of balances
                    delete group.balances[account.id];

                    // Update the database
                    fireTrans.update(groupRef, {
                        members: admin.firestore.FieldValue.arrayRemove(userId),
                        accounts: admin.firestore.FieldValue.arrayRemove(account),
                        balances: group.balances,
                    });
                } else {
                    // If the user was the last account in the group, just leave and archive the group.
                    // TODO Cron job for clean-up of archived groups: after 30 days delete the group?
                    fireTrans.update(groupRef, {
                        members: [],
                        archived: true,
                        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                        inviteLink: '404 not found! Die is er lekker niet meer haha!',
                        inviteLinkExpiry: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }

                return account;
            });
    });
});

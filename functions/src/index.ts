import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const {v4: uuidv4} = require('uuid');

admin.initializeApp();

const db = admin.firestore();


exports.createUserObject = functions
    .region('europe-west1')
    .auth
    .user().onCreate((user) => {
        return admin.auth().setCustomUserClaims(user.uid, {
            acceptedTermsAndPrivacy: false,
            termsAndPrivacyVersion: '1',
        }).catch((err) => {
            console.error(err);
        });
    });

exports.acceptTerms = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {
        const userId = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        console.log('setting user claims: ' + userId);

        return admin.auth().setCustomUserClaims(userId, {
                acceptedTermsAndPrivacy: true,
                termsAndPrivacyVersion: data.version,
            })
            .then(() => {
                return true;
            })
            .catch((err) => {
                console.error(err);
                return Promise.reject('An error occurred');
            });
    });

exports.joinGroup = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        const userId = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        const user: any = data.user;

        const groupRef = db.collection('groups').doc(data.groupId);
        const now = admin.firestore.Timestamp.now();

        groupRef.update(
            'members', admin.firestore.FieldValue.arrayUnion(userId)
        ).catch(err => {
            console.error(err);
            throw new functions.https.HttpsError('unknown', 'Error occurred while writing document', err);
        });

        const account = {
            id: uuidv4(),
            name: user.displayName,
            photoUrl: user.photoURL,
            roles: [],
            userId,
            balance: 0,
            createdAt: now,
        };

        return groupRef.update(
            'accounts', admin.firestore.FieldValue.arrayUnion(account)
            )
            .then(() => {
                return account;
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', 'Error occurred while writing document', err);
            });
    });

exports.leaveGroup = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        const userId = context.auth?.uid;

        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        const groupRef = db.collection('groups').doc(data.groupId);

        return db.runTransaction(fireTrans => {
            return fireTrans.get(groupRef)
                .then(groupDoc => {
                    const group = groupDoc?.data();

                    // Check if the group exists
                    if (!groupDoc.exists || !group) {
                        throw new functions.https.HttpsError('not-found', 'No such group document!');
                    }

                    // Check if the user is part of this group
                    if (!group.members.includes(context.auth?.uid)) {
                        throw new functions.https.HttpsError('permission-denied', 'User not member of group');
                    }

                    if (group.members.length > 1) {
                        const account = group.accounts.find((acc: any) => acc.userId === context.auth?.uid);

                        if (account.balance !== 0) {
                            throw new functions.https.HttpsError('permission-denied', 'User account balance not 0');
                        }

                        fireTrans.update(groupRef, {
                            members: admin.firestore.FieldValue.arrayRemove(userId),
                            accounts: admin.firestore.FieldValue.arrayRemove(account),
                        });
                    } else {
                        fireTrans.delete(groupRef);
                    }

                    return group.accounts.find((acc: any) => acc.userId === context.auth?.uid);
                });
        });
    });

exports.editTransaction = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        let currentAccount: any;
        let group: any;
        const groupRef = db.collection('groups').doc(data.groupId);

        return db.runTransaction(fireTrans => {
                return fireTrans.get(groupRef)
                    .then(groupDoc => {
                        group = groupDoc?.data();

                        // Check if the group exists
                        if (!groupDoc.exists || !group) {
                            throw new functions.https.HttpsError('not-found', 'No such group document!');
                        }

                        // Check if the user is part of this group
                        if (!group.members.includes(context.auth?.uid)) {
                            throw new functions.https.HttpsError('permission-denied', 'User not member of group');
                        }

                        if (!data.paymentTransaction) {
                            throw new functions.https.HttpsError('not-found', 'No transaction to be computed!');
                        }

                        currentAccount = group.accounts.find((account: any) => account.userId === context.auth?.uid);

                        // Update the balance of the accounts
                        updateTransactionAccounts(group, data.paymentTransaction);

                        fireTrans.update(groupRef, {
                            accounts: group.accounts,
                            sharedAccounts: group.sharedAccounts,
                        });

                        // Update old transaction and add new transaction to firestore
                        if (data.updatedTransaction.itemCount === 0) {
                            fireTrans.update(groupRef.collection('transactions').doc(data.updatedTransaction.id), {
                                removed: true,
                            });
                        } else {
                            fireTrans.update(groupRef.collection('transactions').doc(data.updatedTransaction.id), {
                                items: data.updatedTransaction.items,
                                itemCount: data.updatedTransaction.itemCount,
                                totalPrice: data.updatedTransaction.totalPrice,
                            });
                        }

                        return data.updatedTransaction;
                    })
                    .catch(err => {
                        console.error(err);
                        throw new functions.https.HttpsError('unknown', 'Error occurred while getting document', err);
                    });
            })
            .then((transaction) => {
                try {
                    const topic = `group_${data.groupId}_all`;

                    const message = {
                        notification: {
                            title: `Transactie in ${group.name} ${transaction.itemCount === 0 ? 'verwijderd' : 'aangepast'}`,
                            body: `${currentAccount.name} heeft een transactie ${transaction.itemCount === 0 ? 'verwijderd' : 'aangepast'}`,
                        },
                        data: {
                            groupId: data.groupId as string,
                        },
                        topic,
                    };

                    admin.messaging().send(message)
                        .catch((error) => {
                            console.error('Error sending message:', error);
                        });
                } catch (e) {
                    console.error(e);
                }

                return transaction;
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', 'Firebase transaction error occurred', err);
            });
    });

exports.addTransaction = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        let currentAccount: any;
        let group: any;
        const groupRef = db.collection('groups').doc(data.groupId);

        return db.runTransaction(transaction => {
                return transaction.get(groupRef)
                    .then(groupDoc => {
                        group = groupDoc?.data();

                        // Check if the group exists
                        if (!groupDoc.exists || !group) {
                            throw new functions.https.HttpsError('not-found', 'No such document!');
                        }

                        // Check if the user is part of this group
                        if (!group.members.includes(context.auth?.uid)) {
                            throw new functions.https.HttpsError('permission-denied', 'User not member of group');
                        }

                        if (!data.transaction) {
                            throw new functions.https.HttpsError('not-found', 'No transaction to be computed!');
                        }

                        currentAccount = group.accounts.find((account: any) => account.userId === context.auth?.uid);

                        // Update the balance of the accounts
                        updateTransactionAccounts(group, data.transaction);

                        const uid = uuidv4();
                        const newTransaction = {
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            createdBy: currentAccount,
                            totalPrice: data.transaction.totalPrice,
                            itemCount: data.transaction.itemCount,
                            items: data.transaction.items,
                        };

                        // Add the transaction to firestore
                        transaction.set(groupRef.collection('transactions').doc(uid), newTransaction);

                        transaction.update(groupRef, {
                            accounts: group.accounts,
                            sharedAccounts: group.sharedAccounts,
                        });

                        return newTransaction;
                    })
                    .catch(err => {
                        console.error(err);
                        throw new functions.https.HttpsError('unknown', 'Error occurred while getting document', err);
                    });
            })
            .then((transaction) => {
                try {
                    const topic = `group_${data.groupId}_all`;

                    const message = {
                        notification: {
                            title: `Nieuwe transactie in ${group.name}`,
                            body: `${currentAccount.name} heeft ${transaction.itemCount} transactie${transaction.itemCount > 1 ? 's' : ''} gedaan!`,
                        },
                        data: {
                            groupId: data.groupId as string,
                        },
                        topic,
                    };

                    admin.messaging().send(message)
                        .catch((error) => {
                            console.error('Error sending message:', error);
                        });
                } catch (e) {
                    console.error(e);
                }

                return transaction;
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', 'Firebase transaction error occurred', err);
            });
    });

export function updateTransactionAccounts(group: any, transaction: any) {
    transaction.items.forEach((t: { amount: number, account: any, product: any }) => {
        let acc: any;
        let index: number;
        switch (t.account.type) {
            case 'user':
                acc = group.accounts.find((account: any) => account.id === t.account.id);

                if (acc) {
                    index = group.accounts.indexOf(acc);
                    // Update balance of the account
                    acc.balance -= (t.product.price * t.amount);
                    group.accounts[index] = acc;
                } else {
                    throw new functions.https.HttpsError('not-found', 'User Account not found!');
                }

                break;
            case 'shared':
                acc = group.sharedAccounts.find((account: any) => account.id === t.account.id);
                if (acc) {
                    index = group.sharedAccounts.indexOf(acc);

                    // Update balance of the account
                    acc.balance -= (t.product.price * t.amount);
                    group.sharedAccounts[index] = acc;
                } else {
                    throw new functions.https.HttpsError('not-found', 'Shared Account not found!');
                }
                break;
        }
    });
}

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const {v4: uuidv4} = require('uuid');

admin.initializeApp();

const db = admin.firestore();

exports.joinGroup = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        const userId = context.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        const groupRef = db.collection('groups').doc(data.groupId);
        const now = admin.firestore.Timestamp.now();

        groupRef.update(
            'members', admin.firestore.FieldValue.arrayUnion(userId)
        ).catch(err => {
            console.error(err);
        });

        groupRef.update(
            'accounts', admin.firestore.FieldValue.arrayUnion({
                id: uuidv4(),
                name: data.displayName,
                roles: [],
                userId,
                balance: 0,
                createdAt: now,
            })
        ).catch(err => {
            console.error(err);
        });

    });

exports.addTransaction = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        const groupRef = db.collection('groups').doc(data.groupId);

        const transactions: any[] = [];

        return db.runTransaction(transaction => {
                return transaction.get(groupRef)
                    .then(groupDoc => {
                        const group = groupDoc?.data();

                        // Check if the group exists
                        if (!groupDoc.exists || !group) {
                            throw new functions.https.HttpsError('not-found', 'No such document!');
                        }

                        // Check if the user is part of this group
                        if (!group.members.includes(context.auth?.uid)) {
                            throw new functions.https.HttpsError('permission-denied', 'User not member of group');
                        }

                        // Timestamp must be the same for every transaction so they can be grouped.
                        const now = admin.firestore.FieldValue.serverTimestamp();

                        data.transactions.forEach((t: any) => {
                            let acc: any;
                            let index: number;
                            switch (t.account.type) {
                                case 'user':
                                    acc = group.accounts.find((account: any) => account.id === t.account.id);
                                    index = group.accounts.indexOf(acc);

                                    // Update balance of the account
                                    acc.balance -= t.totalPrice;
                                    group.accounts[index] = acc;
                                    break;
                                case 'shared':
                                    acc = group.sharedAccounts.find((account: any) => account.id === t.account.id);
                                    index = group.sharedAccounts.indexOf(acc);

                                    // Update balance of the account
                                    acc.balance -= t.totalPrice;
                                    group.sharedAccounts[index] = acc;
                                    break;
                            }

                            // TODO Implement edge case where account is not found, thus transactions are not saved correctly.

                            // tslint:disable-next-line:no-shadowed-variable
                            const uid = uuidv4();

                            const newTransaction = {
                                createdAt: now,
                                createdBy: t.createdBy,
                                createdById: t.createdById,
                                amount: t.amount,
                                totalPrice: t.totalPrice,
                                account: t.account,
                                product: t.product,
                            };

                            // Add the transaction to firestore
                            transaction.set(groupRef.collection('transactions').doc(uid), newTransaction);

                            // @ts-ignore
                            newTransaction.id = uid;
                            // @ts-ignore
                            newTransaction.createdAt = admin.firestore.Timestamp.now().toMillis();

                            transactions.push(newTransaction);
                        });
                        transaction.update(groupRef, {
                            accounts: group.accounts,
                            sharedAccounts: group.sharedAccounts,
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        throw new functions.https.HttpsError('unknown', 'Error occurred while getting document', err);
                    });
            })
            .then(() => {
                return transactions;
            })
            .catch(err => {
                console.error(err);
                throw new functions.https.HttpsError('unknown', 'Firebase transaction error occurred', err);
            });
    });


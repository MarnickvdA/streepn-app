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

        return db.collection('groups').doc(data.groupId).get()
            .then(async (groupSnapshot: any) => {
                const group: any = groupSnapshot.data();
                // Check if the group exists
                if (!groupSnapshot.exists || !group) {
                    throw new functions.https.HttpsError('not-found', 'No such group document! ' + data.groupId);
                }

                if (group.inviteLink !== data.inviteLink) {
                    throw new functions.https.HttpsError('permission-denied', 'Invalid invite link');
                }

                const now = admin.firestore.Timestamp.now();

                if (group.inviteLinkExpiry < now) {
                    throw new functions.https.HttpsError('permission-denied', 'Invite link expired!');
                }

                const accountId = uuidv4();
                const account = {
                    id: accountId,
                    name: user.displayName,
                    photoUrl: user.photoURL,
                    roles: group.accounts.length === 0 ? ['ADMIN'] : [],
                    userId,
                    createdAt: now,
                };

                const batch = db.batch();

                const groupRef = db.collection('groups').doc(data.groupId);
                batch.update(groupRef, {
                    accounts: admin.firestore.FieldValue.arrayUnion(account),
                    members: admin.firestore.FieldValue.arrayUnion(userId),
                });

                await groupRef.set({
                    balances: {
                        [accountId]: {
                            amount: 0,
                            totalIn: 0,
                            totalOut: 0,
                        },
                    },
                }, {merge: true});

                return batch.commit();
            })
            .catch((err: any) => {
                throw new functions.https.HttpsError('internal', err.message);
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
                        const accountBalance = group.balances[account.id];

                        if (accountBalance.amount !== 0 && accountBalance.totalIn !== 0 && accountBalance.totalOut) {
                            throw new functions.https.HttpsError('permission-denied', 'User account balance not 0');
                        }

                        delete group.balances[account.id];

                        fireTrans.update(groupRef, {
                            members: admin.firestore.FieldValue.arrayRemove(userId),
                            accounts: admin.firestore.FieldValue.arrayRemove(account),
                            balances: group.balances,
                        });
                    } else {
                        fireTrans.update(groupRef, {
                            members: [],
                            accounts: [],
                            balances: {},
                            archived: true,
                            archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                            inviteLink: 'Die is er lekker niet meer haha!',
                            inviteLinkExpiry: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }

                    return group.accounts.find((acc: any) => acc.userId === context.auth?.uid);
                });
        });
    });

exports.addStock = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

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

                    if (!data.stock) {
                        throw new functions.https.HttpsError('not-found', 'No stock to be computed!');
                    }

                    const currentProduct = group.products.find((product: any) => product.id === data.stock.productId);

                    if (!currentProduct) {
                        throw new functions.https.HttpsError('not-found', 'Product not found!');
                    }

                    const uid = uuidv4();
                    const newStock = {
                        id: uid,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: data.stock.createdBy,
                        paidBy: data.stock.paidBy,
                        paidAmount: data.stock.paidAmount,
                        productId: data.stock.productId,
                        cost: data.stock.cost,
                        amount: data.stock.amount,
                    };

                    // Add the transaction to firestore
                    fireTrans.set(groupRef.collection('stock').doc(uid), newStock);

                    fireTrans.update(groupRef, {
                        totalIn: admin.firestore.FieldValue.increment(data.stock.cost),
                        products: group.products.map((p: any) => {
                            if (p.id === data.stock.productId) {
                                if (!p.stock || isNaN(p.stock)) {
                                    p.stock = newStock.amount;
                                    p.totalStock = newStock.amount;
                                    p.totalStockWorth = newStock.cost;
                                } else {
                                    p.stock += newStock.amount;
                                    p.totalStock += newStock.amount;
                                    p.totalStockWorth += newStock.cost;
                                }
                            }
                            return p;
                        }),
                    });

                    Object.keys(group.balances).forEach((accId: any) => {
                        const index = data.stock.paidBy.indexOf(accId);
                        if (index >= 0) {
                            fireTrans.update(groupRef, {
                                [`balances.${accId}.amount`]: admin.firestore.FieldValue.increment(data.stock.paidAmount[index]),
                                [`balances.${accId}.totalIn`]: admin.firestore.FieldValue.increment(data.stock.paidAmount[index]),
                            });
                        }
                    });

                    return newStock;
                });
        });
    });

exports.editStock = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

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

                    if (!data.updatedStock || !data.deltaStock) {
                        throw new functions.https.HttpsError('not-found', 'No stock to be computed!');
                    }

                    // Update old stock and update stock in firestore
                    if (data.updatedStock.amount === 0) {
                        fireTrans.update(groupRef.collection('stock').doc(data.updatedStock.id), {
                            removed: true,
                        });
                    } else {
                        fireTrans.update(groupRef.collection('stock').doc(data.updatedStock.id), {
                            paidBy: data.updatedStock.paidBy,
                            paidAmount: data.updatedStock.paidAmount,
                            cost: data.updatedStock.cost,
                            amount: data.updatedStock.amount,
                            productId: data.updatedStock.productId,
                        });
                    }

                    fireTrans.update(groupRef, {
                        totalIn: admin.firestore.FieldValue.increment(data.deltaStock.cost),
                        products: group.products.map((p: any) => {
                            if (p.id === data.deltaStock.productId) {
                                p.stock += data.deltaStock.amount;
                                p.totalStock += data.deltaStock.amount;
                                p.totalStockWorth += data.deltaStock.cost;
                            }

                            // If a different stock item was checked.
                            if (data.updatedStock.productId === p.id && data.updatedStock.productId !== data.deltaStock.productId) {
                                if (!p.stock || isNaN(p.stock)) {
                                    p.stock = data.updatedStock.amount;
                                    p.totalStock = data.updatedStock.amount;
                                    p.totalStockWorth = data.updatedStock.cost;
                                } else {
                                    p.stock += data.updatedStock.amount;
                                    p.totalStock += data.updatedStock.amount;
                                    p.totalStockWorth += data.updatedStock.cost;
                                }
                            }

                            return p;
                        }),
                    });

                    Object.keys(group.balances).forEach((accId: any) => {
                        const index = data.deltaStock.paidBy.indexOf(accId);
                        if (index >= 0) {
                            fireTrans.update(groupRef, {
                                [`balances.${accId}.amount`]: admin.firestore.FieldValue.increment(data.deltaStock.paidAmount[index]),
                                [`balances.${accId}.totalIn`]: admin.firestore.FieldValue.increment(data.deltaStock.paidAmount[index]),
                            });
                        }
                    });

                    return data.updatedStock;
                });
        });
    });

exports.removeStock = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

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

                    if (!data.stock) {
                        throw new functions.https.HttpsError('not-found', 'No stock to be computed!');
                    }

                    const currentAccount = group.accounts.find((account: any) => account.userId === context.auth?.uid);
                    const currentProduct = group.products.find((product: any) => product.id === data.stock.productId);

                    if (!currentProduct) {
                        throw new functions.https.HttpsError('not-found', 'Product not found!');
                    }

                    const uid = uuidv4();
                    const removedStock = {
                        id: uid,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: currentAccount.id,
                        productId: data.stock.productId,
                        amount: -data.stock.amount,
                        writtenOff: true,
                    };

                    // Add the transaction to firestore
                    fireTrans.set(groupRef.collection('stock').doc(uid), removedStock);

                    fireTrans.update(groupRef, {
                        products: group.products.map((p: any) => {
                            if (p.id === data.stock.productId) {
                                if (!p.stock || isNaN(p.stock)) {
                                    p.stock = removedStock.amount;
                                    p.totalStock = removedStock.amount;
                                } else {
                                    p.stock += removedStock.amount;
                                    p.totalStock += removedStock.amount;
                                }
                            }
                            return p;
                        }),
                    });

                    return removedStock;
                });
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

        return db.runTransaction(fireTrans => {
                return fireTrans.get(groupRef)
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
                        updateTransactionAccounts(fireTrans, data.groupId, group, data.transaction);

                        const uid = uuidv4();
                        const newTransaction = {
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            createdBy: currentAccount.id,
                            totalPrice: data.transaction.totalPrice,
                            itemCount: data.transaction.itemCount,
                            items: data.transaction.items,
                            removed: false,
                        };

                        // Add the transaction to firestore
                        fireTrans.set(groupRef.collection('transactions').doc(uid), newTransaction);

                        fireTrans.update(groupRef, {
                            totalOut: admin.firestore.FieldValue.increment(data.transaction.totalPrice),
                            products: group.products,
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

                        if (!data.deltaTransaction || !data.updatedTransaction) {
                            throw new functions.https.HttpsError('not-found', 'No transaction to be computed!');
                        }

                        currentAccount = group.accounts.find((account: any) => account.userId === context.auth?.uid);

                        // Update the balance of the accounts
                        updateTransactionAccounts(fireTrans, data.groupId, group, data.deltaTransaction);

                        fireTrans.update(groupRef, {
                            totalOut: admin.firestore.FieldValue.increment(data.deltaTransaction.totalPrice),
                            products: group.products,
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

exports.settleSharedAccount = functions
    .region('europe-west1')
    .https
    .onCall((data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

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

                    if (!data.sharedAccountId && !group.sharedAccounts.find((acc: any) => acc.id === data.sharedAccountId)) {
                        throw new functions.https.HttpsError('not-found', 'No shared account to be found!');
                    }

                    if (!data.payers) {
                        throw new functions.https.HttpsError('not-found', 'No payers to be found!');
                    }

                    Object.keys(group.balances).forEach((accId: any) => {
                        const payer = data.payers[accId];
                        if (payer) {
                            fireTrans.update(groupRef, {
                                [`balances.${accId}.amount`]: admin.firestore.FieldValue.increment(-payer),
                                [`balances.${accId}.totalOut`]: admin.firestore.FieldValue.increment(+payer),
                            });
                        }
                    });

                    fireTrans.update(groupRef, {
                        [`balances.${data.sharedAccountId}.amount`]: 0,
                        [`balances.${data.sharedAccountId}.totalOut`]: 0,
                    });

                    fireTrans.update(groupRef, {
                        sharedAccounts: group.sharedAccounts.map((acc: any) => {
                            if (acc.id === data.sharedAccountId) {
                                acc.settledAt = admin.firestore.Timestamp.now();
                            }

                            return acc;
                        }),
                    });
                });
        });
    });

export function updateTransactionAccounts(fireTrans: any, groupId: string, group: any, transaction: any) {
    transaction.items.forEach((t: { amount: number, accountId: string, productId: string, productPrice: number }) => {
        let acc: any = group.accounts.find((account: any) => account.id === t.accountId);

        if (!acc) {
            acc = group.sharedAccounts.find((account: any) => account.id === t.accountId);
        }

        if (!acc) {
            throw new functions.https.HttpsError('not-found', 'Shared Account not found!');
        }

        fireTrans.update(db.collection('groups').doc(groupId) as any, {
            [`balances.${acc.id}.amount`]: admin.firestore.FieldValue.increment(-(t.productPrice * t.amount)),
            [`balances.${acc.id}.totalOut`]: admin.firestore.FieldValue.increment(t.productPrice * t.amount),
        });

        group.products = group.products.map((pr: any) => {
            if (pr.id === t.productId) {
                if (!pr.stock || isNaN(pr.stock)) {
                    pr.stock = 0;
                }

                pr.stock -= t.amount;
            }
            return pr;
        });
    });
}

export function getAccountBalance(group: any, accountId: string): { amount: number, totalIn: number, totalOut: number } {
    return group.balances[accountId];
}

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

                        if (accountBalance.totalIn !== 0 && accountBalance.totalOut !== 0) {
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
                        paidById: data.stock.paidById,
                        productId: data.stock.productId,
                        cost: data.stock.cost,
                        amount: data.stock.amount,
                    };

                    // Add the transaction to firestore
                    fireTrans.set(groupRef.collection('stock').doc(uid), newStock);

                    fireTrans.update(groupRef, {
                        totalIn: admin.firestore.FieldValue.increment(data.stock.cost),
                        [`productData.${data.stock.productId}.totalIn`]: admin.firestore.FieldValue.increment(data.stock.cost),
                        [`productData.${data.stock.productId}.amountIn`]: admin.firestore.FieldValue.increment(data.stock.amount),
                        [`balances.${data.stock.paidById}.totalIn`]: admin.firestore.FieldValue.increment(data.stock.cost),
                        [`balances.${data.stock.paidById}.products.${data.stock.productId}.totalIn`]:
                            admin.firestore.FieldValue.increment(data.stock.cost),
                        [`balances.${data.stock.paidById}.products.${data.stock.productId}.amountIn`]:
                            admin.firestore.FieldValue.increment(data.stock.amount),
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
                            paidById: data.updatedStock.paidById,
                            cost: data.updatedStock.cost,
                            amount: data.updatedStock.amount,
                            productId: data.updatedStock.productId,
                        });
                    }

                    const groupUpdate: any = {
                        totalIn: admin.firestore.FieldValue.increment(data.deltaStock.cost),
                        [`productData.${data.deltaStock.productId}.totalIn`]: admin.firestore.FieldValue.increment(data.deltaStock.cost),
                        [`productData.${data.deltaStock.productId}.amountIn`]: admin.firestore.FieldValue.increment(data.deltaStock.amount),
                        [`balances.${data.deltaStock.paidById}.totalIn`]: admin.firestore.FieldValue.increment(data.deltaStock.cost),
                        [`balances.${data.deltaStock.paidById}.products.${data.deltaStock.productId}.totalIn`]:
                            admin.firestore.FieldValue.increment(data.deltaStock.cost),
                        [`balances.${data.deltaStock.paidById}.products.${data.deltaStock.productId}.amountIn`]:
                            admin.firestore.FieldValue.increment(data.deltaStock.amount),
                    };

                    if (data.updatedStock.productId !== data.updatedStock.productId) {
                        groupUpdate[`productData.${data.updatedStock.productId}.totalIn`]
                            = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                        groupUpdate[`productData.${data.updatedStock.productId}.amountIn`]
                            = admin.firestore.FieldValue.increment(data.updatedStock.amount);
                        groupUpdate[`balances.${data.updatedStock.paidById}.totalIn`]
                            = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                        groupUpdate[`balances.${data.updatedStock.paidById}.products.${data.updatedStock.productId}.totalIn`]
                            = admin.firestore.FieldValue.increment(data.updatedStock.cost);
                        groupUpdate[`balances.${data.updatedStock.paidById}.products.${data.updatedStock.productId}.amountIn`]
                            = admin.firestore.FieldValue.increment(data.updatedStock.amount);
                    }

                    fireTrans.update(groupRef, groupUpdate);

                    return data.updatedStock;
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
                        const updateObject: any = getTransactionUpdateObject(group, data.transaction);

                        const uid = uuidv4();
                        const newTransaction = {
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            createdBy: currentAccount.id,
                            items: data.transaction.items,
                            removed: false,
                        };

                        // Add the transaction to firestore
                        fireTrans.set(groupRef.collection('transactions').doc(uid), newTransaction);

                        fireTrans.update(groupRef, {
                            ...updateObject,
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
                            body: `${currentAccount.name} heeft ${transaction.items.length} transactie${transaction.items.length > 1 ? 's' : ''} gedaan!`,
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
                        const updateObject: any = getTransactionUpdateObject(group, data.deltaTransaction);

                        fireTrans.update(groupRef, {
                            ...updateObject,
                        });

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
                            title: `Transactie in ${group.name} ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
                            body: `${currentAccount.name} heeft een transactie ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
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

                    if (!data.settlement) {
                        throw new functions.https.HttpsError('not-found', 'No settlement to be found!');
                    }

                    const updateObject: any = {
                        [`balances.${data.sharedAccountId}.totalIn`]: 0,
                        [`balances.${data.sharedAccountId}.totalOut`]: 0,
                        [`balances.${data.sharedAccountId}.products`]: {},
                        sharedAccounts: group.sharedAccounts.map((acc: any) => {
                            if (acc.id === data.sharedAccountId) {
                                acc.settledAt = admin.firestore.Timestamp.now();
                            }

                            return acc;
                        }),
                    };

                    Object.keys(data.settlement).forEach((accountId: string) => {
                        const payer: {
                            totalOut: number;
                            products: {
                                [productId: string]: {
                                    totalOut: number,
                                    amountOut: number,
                                };
                            };
                        } = data.settlement[accountId];

                        updateObject[`balances.${accountId}.totalOut`] = admin.firestore.FieldValue.increment(payer.totalOut);

                        Object.keys(payer.products).forEach((productId: string) => {
                            updateObject[`balances.${accountId}.products.${productId}.totalOut`]
                                = admin.firestore.FieldValue.increment(payer.products[productId].totalOut);
                            updateObject[`balances.${accountId}.products.${productId}.amountOut`]
                                = admin.firestore.FieldValue.increment(payer.products[productId].amountOut);
                        });
                    });

                    fireTrans.update(groupRef, updateObject);
                });
        });
    });

exports.settleGroup = functions
    .region('europe-west1')
    .https
    .onCall(async (data, context) => {

        if (!context.auth?.uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
        }

        let group: any;
        const groupRef = db.collection('groups').doc(data.groupId);

        try {
            await groupRef.set({
                isSettling: true,
                settleTimeout: admin.firestore.Timestamp.now(),
            }, {merge: true});
        } catch (e) {
            console.error(e);
        }

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

                    try {
                        const newAccountBalances: {
                            [accountId: string]: {
                                newBalance: number,
                                oldBalance: number,
                                straighten: number,
                                settle: number,
                                products: {
                                    [productId: string]: {
                                        amountIn: number,
                                        amountOut: number,
                                        totalIn: number,
                                        totalOut: number,
                                    },
                                },
                            },
                        } = {};

                        const newProductBalances: {
                            [productId: string]: {
                                [accountId: string]: {
                                    percentageIn: number,
                                    amountIn?: number,
                                    totalIn?: number,
                                },
                            },
                        } = {};

                        // Interate through every account
                        group.accounts.forEach((account: { id: string }) => {
                            const accountBalance: {
                                totalIn: number,
                                totalOut: number,
                                products: {
                                    [productId: string]: {
                                        amountIn: number,
                                        amountOut: number,
                                        totalIn: number,
                                        totalOut: number,
                                    },
                                },
                            } = group.balances[account.id];

                            const newBalance = {
                                newBalance: 0,
                                oldBalance: 0,
                                straighten: 0,
                                settle: 0,
                                products: {},
                            };

                            // Iterate through every product this account has interacted with
                            if (accountBalance.products) {
                                Object.keys(accountBalance.products).forEach((productId: string) => {
                                    const product: {
                                        price: number,
                                    } = group.products.find((p: any) => p.id === productId);
                                    const pData: {
                                        amountIn: number,
                                        amountOut: number,
                                        totalIn: number,
                                        totalOut: number,
                                    } = group.productData[productId];
                                    const totalAmountIn: number = pData.amountIn;

                                    const maxRevenue = (pData.amountIn - pData.amountOut) * product.price;
                                    const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                                    const restWorth = Math.round((worthDifference
                                        * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                                        + maxRevenue);

                                    // Safe guard for dividing by 0
                                    if (totalAmountIn > 0) {
                                        const updatedBalance: number =
                                            Math.round(restWorth * (accountBalance.products?.[productId].amountIn || 0) / totalAmountIn);
                                        const productWorthDifference: number =
                                            Math.round(-worthDifference
                                                * (accountBalance.products?.[productId].amountOut || 0) / totalAmountIn);

                                        newBalance.newBalance += updatedBalance;
                                        newBalance.straighten += productWorthDifference;

                                        if (!newProductBalances[productId]) {
                                            newProductBalances[productId] = {};
                                        }

                                        if (accountBalance.products?.[productId].amountIn) {
                                            newProductBalances[productId][account.id] = {
                                                percentageIn: accountBalance.products[productId].amountIn / totalAmountIn,
                                            };
                                        }
                                    }
                                });
                            }

                            const amount: number = accountBalance.totalIn - accountBalance.totalOut;
                            newBalance.oldBalance += amount;
                            newBalance.settle = amount + newBalance.straighten - newBalance.newBalance;
                            newAccountBalances[account.id] = newBalance;
                        });

                        Object.keys(newProductBalances).forEach((productId: string) => {
                            const p: { price: number } = group.products.find((pr: { id: string }) => pr.id === productId);
                            const pData: {
                                amountIn: number,
                                amountOut: number,
                                totalIn: number,
                                totalOut: number,
                            } = group.productData[productId];

                            const maxRevenue = (pData.amountIn - pData.amountOut) * p.price;
                            const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                            const restWorth = Math.round((worthDifference
                                * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                                + maxRevenue);

                            const productData = {
                                totalIn: restWorth,
                                totalOut: 0,
                                amountIn: (pData.amountIn - pData.amountOut),
                                amountOut: 0,
                            };

                            let newAmountInSum = 0;
                            let newTotalInSum = 0;

                            Object.keys(newProductBalances[productId]).forEach((accountId: string) => {
                                const newAmountIn: number
                                    = Math.floor(((newProductBalances[productId][accountId].percentageIn * productData.amountIn)
                                    + Number.EPSILON) * 100) / 100;
                                const newTotalIn: number
                                    = Math.floor(newProductBalances[productId][accountId].percentageIn
                                    * productData.totalIn + Number.EPSILON);

                                newProductBalances[productId][accountId].amountIn = newAmountIn;
                                newProductBalances[productId][accountId].totalIn = newTotalIn;

                                newAmountInSum += newAmountIn;
                                newTotalInSum += newTotalIn;
                            });

                            // Calculate the remainder with 2 decimal accuracy for the amount
                            let amountRemainder = Math.round(((productData.amountIn + Number.EPSILON) * 100)
                                - ((newAmountInSum + Number.EPSILON) * 100));
                            let totalRemainder = Math.round(productData.totalIn - newTotalInSum);

                            const accountKeys: string[] = Object.keys(newProductBalances[productId]);
                            for (let i = 0; amountRemainder > 0; i = ((i + 1) % accountKeys.length), amountRemainder--) {
                                // @ts-ignore
                                newProductBalances[productId][accountKeys[i]].amountIn += 0.01;
                            }

                            for (let i = 0; totalRemainder > 0; i = ((i + 1) % accountKeys.length), totalRemainder--) {
                                // @ts-ignore
                                newProductBalances[productId][accountKeys[i]].totalIn += 1;
                            }
                        });

                        Object.keys(newAccountBalances).forEach((accountId: string) => {
                            Object.keys(newProductBalances).forEach((productId: string) => {
                                Object.keys(newProductBalances[productId]).filter((key: string) =>
                                    key === accountId).forEach((_: string) => {
                                    if (!newAccountBalances[accountId].products[productId]) {
                                        newAccountBalances[accountId].products[productId] = {
                                            amountIn: 0,
                                            amountOut: 0,
                                            totalIn: 0,
                                            totalOut: 0,
                                        };
                                    }


                                    newAccountBalances[accountId].products[productId].amountIn // @ts-ignore
                                        += newProductBalances[productId][accountId].amountIn;
                                    // @ts-ignore
                                    newAccountBalances[accountId].products[productId].totalIn // @ts-ignore
                                        += newProductBalances[productId][accountId].totalIn;
                                });
                            });
                        });

                        const updateBatch: any = {
                            isSettling: false,
                            settledAt: admin.firestore.FieldValue.serverTimestamp(),
                            totalIn: 0,
                            totalOut: 0,
                        };

                        group.accounts.forEach((account: { id: string }) => {
                            const balance = newAccountBalances[account.id];
                            if (balance) {
                                updateBatch[`balances.${account.id}`] = {
                                    totalIn: balance.newBalance,
                                    totalOut: 0,
                                    products: balance.products,
                                };

                                updateBatch.totalIn += balance.newBalance;
                            } else {
                                updateBatch[`balances.${account.id}`] = {
                                    totalIn: 0,
                                    totalOut: 0,
                                };
                            }
                        });

                        group.products.forEach((p: { id: string, price: number }) => {
                            const pData: {
                                amountIn: number,
                                amountOut: number,
                                totalIn: number,
                                totalOut: number,
                            } = group.productData[p.id];

                            const maxRevenue = (pData.amountIn - pData.amountOut) * p.price;
                            const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                            const restWorth = Math.round((worthDifference
                                * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                                + maxRevenue);

                            updateBatch[`productData.${p.id}`] = {
                                totalIn: restWorth,
                                totalOut: 0,
                                amountIn: (pData.amountIn - pData.amountOut),
                                amountOut: 0,
                            };
                        });

                        let toSettle: {
                            accountId: string,
                            settle: number,
                        }[] = [];

                        const settled: {
                            [accountId: string]: {
                                settle: number,
                                receives: {
                                    [accountId: string]: number
                                },
                                owes: {
                                    [accountId: string]: number
                                },
                            },
                        } = {};

                        Object.keys(newAccountBalances).forEach((accountId: string) => {
                            toSettle.push({
                                accountId,
                                settle: newAccountBalances[accountId].settle,
                            });

                            settled[accountId] = {
                                settle: newAccountBalances[accountId].settle,
                                receives: {},
                                owes: {},
                            };
                        });

                        toSettle = toSettle.sort(((a, b) => a.settle > b.settle ? 1 : -1));

                        let low;
                        let high;
                        for (low = 0, high = toSettle.length - 1; low < high;) {
                            const lowest = toSettle[low];
                            const highest = toSettle[high];

                            if (lowest.settle >= 0) {
                                break;
                            }

                            // Highest value cannot fully cover the lowest.
                            if (highest.settle + lowest.settle < 0) {
                                settled[highest.accountId].receives[lowest.accountId] = highest.settle;
                                settled[lowest.accountId].owes[highest.accountId] = highest.settle;
                                lowest.settle += highest.settle;
                                high--;
                            } else { // Highest value can fully cover the lowest
                                settled[highest.accountId].receives[lowest.accountId] = Math.abs(lowest.settle);
                                settled[lowest.accountId].owes[highest.accountId] = Math.abs(lowest.settle);
                                highest.settle += lowest.settle;
                                low++;
                            }
                        }

                        const currentAccount = group.accounts.find((account: any) => account.userId === context.auth?.uid);

                        const settlement: any = {
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            createdBy: currentAccount.id,
                            items: settled,
                            accounts: {},
                        };

                        group.accounts.forEach((acc: { id: string, name: string }) => {
                            settlement.accounts[acc.id] = {
                                name: acc.name,
                            };
                        });

                        fireTrans.update(groupRef, updateBatch);
                        fireTrans.create(groupRef.collection('settlements').doc(uuidv4()), settlement);
                    } catch (e) {
                        console.error(e);
                        throw new functions.https.HttpsError('internal', e.message);
                    }
                });
        });
    });


export function getTransactionUpdateObject(group: any, transaction: any): any {
    const updateObject: any = {};
    let totalPrice = 0;

    const productData: {
        [id: string]: {
            amountOut: number,
            totalOut: number,
        }
    } = {};

    const accountData: {
        [id: string]: {
            totalOut: number,
        }
    } = {};

    transaction.items
        .forEach((t: { amount: number, accountId: string, productId: string, productPrice: number }) => {
            let acc: any = group.accounts.find((account: any) => account.id === t.accountId);

            if (!acc) {
                acc = group.sharedAccounts.find((account: any) => account.id === t.accountId);
            }

            if (!acc) {
                throw new functions.https.HttpsError('not-found', 'Shared Account not found!');
            }

            const productPrice = t.productPrice * t.amount;
            totalPrice += productPrice;

            if (!productData[t.productId]) {
                productData[t.productId] = {
                    amountOut: 0,
                    totalOut: 0,
                };
            }

            if (!accountData[t.accountId]) {
                accountData[t.accountId] = {
                    totalOut: 0,
                };
            }

            productData[t.productId].totalOut += productPrice;
            productData[t.productId].amountOut += t.amount;
            accountData[t.accountId].totalOut += productPrice;

            updateObject[`balances.${acc.id}.products.${t.productId}.amountOut`]
                = admin.firestore.FieldValue.increment(t.amount);
            updateObject[`balances.${acc.id}.products.${t.productId}.totalOut`]
                = admin.firestore.FieldValue.increment(t.productPrice * t.amount);
        });


    Object.keys(productData).forEach((productId: string) => {
        updateObject[`productData.${productId}.totalOut`]
            = admin.firestore.FieldValue.increment(productData[productId].totalOut);
        updateObject[`productData.${productId}.amountOut`]
            = admin.firestore.FieldValue.increment(productData[productId].amountOut);
    });

    Object.keys(accountData).forEach((accountId: string) => {
        updateObject[`balances.${accountId}.totalOut`]
            = admin.firestore.FieldValue.increment(accountData[accountId].totalOut);
    });

    updateObject.totalOut = admin.firestore.FieldValue.increment(totalPrice);

    return updateObject;
}

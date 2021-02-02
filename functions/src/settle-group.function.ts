import * as functions from 'firebase-functions';
import {ErrorMessage} from './models/error-message';
import * as admin from 'firebase-admin';
import {Balance, Group, Product, ProductData, SettleMap, Settlement, UserAccount} from './models';

const {v4: uuidv4} = require('uuid');
const db = admin.firestore();

interface SettleGroupData {
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

                    const newAccountBalances: {
                        [accountId: string]: {
                            newBalance: number,
                            oldBalance: number,
                            straighten: number,
                            settle: number,
                            products: {
                                [productId: string]: ProductData,
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
                    group.accounts.forEach((account: UserAccount) => {
                        const accountBalance: Balance = group.balances[account.id];

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
                                const product: Product | undefined = group.products.find((p: any) => p.id === productId);
                                const pData: ProductData | undefined = group.productData[productId];

                                if (!product || !pData) {
                                    throw new functions.https.HttpsError('not-found', ErrorMessage.PRODUCT_NOT_FOUND);
                                }

                                const totalAmountIn: number = pData.amountIn;

                                const maxRevenue = (pData.amountIn - pData.amountOut) * product.price;
                                const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                                const restWorth = Math.round((worthDifference
                                    * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                                    + maxRevenue);

                                // Safe guard for dividing by 0
                                if (totalAmountIn > 0) {
                                    const updatedBalance: number =
                                        Math.round(restWorth
                                            * (accountBalance.products?.[productId].amountIn || 0) / totalAmountIn);
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
                        const product: Product | undefined = group.products.find((pr: { id: string }) => pr.id === productId);
                        const pData: ProductData | undefined = group.productData[productId];

                        if (!product || !pData) {
                            throw new functions.https.HttpsError('not-found', ErrorMessage.PRODUCT_NOT_FOUND);
                        }

                        const maxRevenue = (pData.amountIn - pData.amountOut) * product.price;
                        const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                        const restWorth = Math.round((worthDifference
                            * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                            + maxRevenue);

                        const productData: ProductData = {
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
                                    } as ProductData;
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

                    group.products.forEach((product: Product) => {
                        const pData: ProductData = group.productData[product.id];

                        const maxRevenue = (pData.amountIn - pData.amountOut) * product.price;
                        const worthDifference = (pData.totalIn - pData.totalOut) - maxRevenue;
                        const restWorth = Math.round((worthDifference
                            * (pData.amountIn !== 0 ? 1 - pData.amountOut / pData.amountIn : 0))
                            + maxRevenue);

                        updateBatch[`productData.${product.id}`] = {
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

                    const settled: SettleMap = {};

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

                    const currentAccount: UserAccount | undefined
                        = group.accounts.find((account: UserAccount) => account.userId === context.auth?.uid);

                    if (!currentAccount) {
                        throw new functions.https.HttpsError('not-found', ErrorMessage.USER_ACCOUNT_NOT_FOUND);
                    }

                    const settlement: Settlement = {
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: currentAccount.id,
                        items: settled,
                        accounts: {},
                    };

                    group.accounts.forEach((acc: UserAccount) => {
                        settlement.accounts[acc.id] = {
                            name: acc.name,
                        };
                    });

                    fireTrans.update(groupRef, updateBatch);
                    return fireTrans.create(groupRef.collection('settlements').doc(uuidv4()), settlement);
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

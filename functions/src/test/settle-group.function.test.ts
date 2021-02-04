// const test = require('firebase-functions-test')();

import {Group, Settlement} from '../models';
import {AccountBalanceMap, calculateNewBalance, calculateSettlement, deriveUpdateBatch} from '../helpers/settlement.helper';

const assert = require('assert');
describe('settle-group.function', () => {
    const group: Group = {
        id: '',
        createdAt: undefined,
        name: 'Test',
        currency: 'EUR',
        inviteLink: '12345678',
        inviteLinkExpiry: undefined,

        members: ['user1', 'user2', 'user3'],
        accounts: [
            {
                createdAt: undefined,
                id: 'account1',
                name: 'Account 1',
                photoUrl: '',
                roles: [],
                type: 'user',
                userId: 'user1',
            },
            {
                createdAt: undefined,
                id: 'account2',
                name: 'Account 2',
                photoUrl: '',
                roles: [],
                type: 'user',
                userId: 'user2',
            },
            {
                createdAt: undefined,
                id: 'account3',
                name: 'Account 3',
                photoUrl: '',
                roles: [],
                type: 'user',
                userId: 'user3',
            },
        ],
        sharedAccounts: [],
        products: [
            {
                createdAt: undefined,
                id: 'product1',
                name: 'Product1',
                price: 50,
            },
        ],

        totalIn: 0,
        totalOut: 0,

        productData: {
            ['product1']: {
                amountIn: 24,
                amountOut: 12 + 4 + 6,
                totalIn: 1299,
                totalOut: 600 + 200 + 300,
            },
        },

        balances: {
            ['account1']: {
                products: {
                    ['product1']: {
                        amountIn: 24,
                        amountOut: 12,
                        totalIn: 1299,
                        totalOut: 600,
                    },
                },
                totalIn: 1299,
                totalOut: 600,
            },
            ['account2']: {
                products: {
                    ['product1']: {
                        amountIn: 0,
                        amountOut: 4,
                        totalIn: 0,
                        totalOut: 200,
                    },
                },
                totalIn: 0,
                totalOut: 200,
            },
            ['account3']: {
                products: {
                    ['product1']: {
                        amountIn: 0,
                        amountOut: 6,
                        totalIn: 0,
                        totalOut: 300,
                    },
                },
                totalIn: 0,
                totalOut: 300,
            },
        },
    };
    describe('settleGroup()', () => {
        const newBalances: AccountBalanceMap = calculateNewBalance(group);
        const updateBatch: any = deriveUpdateBatch(group, newBalances); // Included because it includes side effects for newBalances
        const settlement: Settlement = calculateSettlement(group, 'user1', newBalances);

        it('should have a settle sum of 0', () => {
            let settleSum = 0;
            Object.keys(settlement.items).forEach((accountId: string) => {
                settleSum += settlement.items[accountId].settle;
            });

            assert.strictEqual(settleSum, 0);
        });

        it('should have a group totalIn equal to products totalIn', () => {
            let totalIn = 0;
            Object.keys(updateBatch.productData).forEach((productId: string) => {
                totalIn += updateBatch.productData[productId]?.totalIn || 0;
            });

            assert.strictEqual(totalIn, updateBatch.totalIn);
        });

        describe('every account', () => {
            it('should have the new balance be equal to the sum of the products worth', () => {
                Object.keys(newBalances).forEach((accountId: string) => {
                    let productSum = 0;
                    Object.keys(newBalances[accountId].products).forEach((productId: string) => {
                        productSum += newBalances[accountId].products[productId].totalIn;
                    });

                    assert.strictEqual(newBalances[accountId].newBalance, productSum);
                });
            });

            it('should not contain any products with non-zero out values', () => {
                Object.keys(newBalances).forEach((key: string) => {
                    Object.keys(newBalances[key].products).forEach((productKey: string) => {
                        assert.strictEqual(newBalances[key].products[productKey].amountOut, 0);
                        assert.strictEqual(newBalances[key].products[productKey].totalOut, 0);
                    });
                });
            });

            it('every owes should match with receives', () => {
                Object.keys(settlement.items).forEach((accountId: string) => {
                    Object.keys(settlement.items[accountId].owes).forEach((owesId: string) => {
                        assert.strictEqual(settlement.items[owesId].receives[accountId], settlement.items[accountId].owes[owesId]);
                    });
                });
            });

            it('every receives should match with owes', () => {
                Object.keys(settlement.items).forEach((accountId: string) => {
                    Object.keys(settlement.items[accountId].receives).forEach((receivesId: string) => {
                        assert.notStrictEqual(settlement.items[receivesId].owes[accountId], undefined);
                        assert.strictEqual(settlement.items[receivesId].owes[accountId], settlement.items[accountId].receives[receivesId]);
                    });
                });
            });
        });
    });
});

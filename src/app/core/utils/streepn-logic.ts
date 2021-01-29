import {Balance, Group, Product, UserAccount} from '@core/models';

export function shuffle(array: any[]) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export interface AccountPayout {
    totalOut: number;
    products: {
        [productId: string]: {
            totalOut: number,
            amountOut: number,
        }
    };
}

/**
 * Calculate how the shared account should be splitted
 * @param balance balance of the shared Account
 * @param count amount of payers
 */
export function calculatePayout(balance: Balance, count: number): AccountPayout[] {
    let payout: AccountPayout[] = [];

    // Fill the payout object
    for (let i = 0; i < count; i++) {
        const data = {
            totalOut: 0,
            products: {}
        };

        Object.keys(balance.products).forEach(productId => {
            data.products[productId] = {
                totalOut: 0,
                amountOut: 0,
            };
        });

        payout.push(data);
    }

    if (balance.products && count > 0) {
        Object.keys(balance.products).forEach((productId) => {
            const productPayout: {
                totalOut: number,
                amountOut: number,
            }[] = [];

            // Fill the product payout object
            for (let i = 0; i < count; i++) {
                productPayout.push({
                    totalOut: 0,
                    amountOut: 0,
                });
            }

            const amountOut = balance.products[productId].amountOut;
            const totalOut = balance.products[productId].totalOut;

            // Get the mean payment and amount of the product per account
            const meanTotal = Math.floor(totalOut / count);
            const meanAmount = Math.floor((amountOut / count) * 100) / 100; // Round off to two decimals

            for (let i = 0; i < count; i++) {
                productPayout[i].totalOut = meanTotal;
                productPayout[i].amountOut = meanAmount;
            }

            // Calculate the remainders of the mean payments and amount to split the amounts
            let remainderTotal = totalOut - (meanTotal * count);
            let remainderAmount = Math.round((amountOut - (meanAmount * count)) * 100);

            for (let i = 0; remainderTotal > 0; i++, remainderTotal--) {
                productPayout[i].totalOut += 1;
            }

            for (let i = 0; remainderAmount > 0; i++, remainderAmount--) {
                productPayout[i].amountOut += 0.01;
            }

            // Sort the payout array to give priority for the majority of the billing to the accounts that have paid the least.
            payout = payout.sort((p1, p2) => p1.totalOut < p2.totalOut ? -1 : 1);

            // Assign the product payout to the accounts
            productPayout
                .forEach((value, index) => {
                    payout[index].totalOut += value.totalOut;

                    if (!payout[index].products) {
                        payout[index].products = {};
                    }

                    payout[index].products[productId] = {
                        totalOut: value.totalOut,
                        amountOut: value.amountOut,
                    };
                });
        });
    }

    // Add randomness to avoid that the first person in the list is always paying most.
    return shuffle(payout);
}

export function calculateSettlement(group: Group) {
    const startFn = performance.now();

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
    group.accounts.forEach((account: UserAccount) => {
        const accountBalance = account.balance;

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
                const product = group.getProductById(productId);
                const totalAmountIn = product.amountIn;

                // Safe guard for dividing by 0
                if (totalAmountIn > 0) {
                    const updatedBalance =
                        Math.round(product.restWorth * (accountBalance.products?.[productId].amountIn || 0) / totalAmountIn);
                    const productWorthDifference =
                        Math.round(-product.worthDifference * (accountBalance.products?.[productId].amountOut || 0) / totalAmountIn);

                    newBalance.newBalance += updatedBalance;
                    newBalance.straighten += productWorthDifference;

                    if (!newProductBalances[productId]) {
                        newProductBalances[productId] = {};
                    }

                    if (accountBalance.products?.[productId].amountIn) {
                        newProductBalances[productId][account.id] = {
                            percentageIn: accountBalance.products[productId].amountIn / totalAmountIn
                        };
                    }
                }
            });
        }

        newBalance.oldBalance += account.balance.amount;
        newBalance.settle = account.balance.amount + newBalance.straighten - newBalance.newBalance;
        newAccountBalances[account.id] = newBalance;
    });

    Object.keys(newProductBalances).forEach((productId: string) => {
        const p = group.products.find((pr: Product) => pr.id === productId);
        const productData = {
            totalIn: p.restWorth,
            totalOut: 0,
            amountIn: p.stock,
            amountOut: 0,
        };

        let newAmountInSum = 0;
        let newTotalInSum = 0;

        Object.keys(newProductBalances[productId]).forEach((accountId: string) => {
            const newAmountIn
                = Math.floor(((newProductBalances[productId][accountId].percentageIn * productData.amountIn) + Number.EPSILON) * 100) / 100;
            const newTotalIn
                = Math.floor(newProductBalances[productId][accountId].percentageIn * productData.totalIn + Number.EPSILON);

            newProductBalances[productId][accountId].amountIn = newAmountIn;
            newProductBalances[productId][accountId].totalIn = newTotalIn;

            newAmountInSum += newAmountIn;
            newTotalInSum += newTotalIn;
        });

        // Calculate the remainder with 2 decimal accuracy for the amount
        let amountRemainder = Math.round(((productData.amountIn + Number.EPSILON) * 100) - ((newAmountInSum + Number.EPSILON) * 100));
        let totalRemainder = Math.round(productData.totalIn - newTotalInSum);

        const accountKeys = Object.keys(newProductBalances[productId]);
        for (let i = 0; amountRemainder > 0; i = ((i + 1) % accountKeys.length), amountRemainder--) {
            newProductBalances[productId][accountKeys[i]].amountIn += 0.01;
        }

        for (let i = 0; totalRemainder > 0; i = ((i + 1) % accountKeys.length), totalRemainder--) {
            newProductBalances[productId][accountKeys[i]].totalIn += 1;
        }
    });

    Object.keys(newAccountBalances).forEach((accountId: string) => {
        Object.keys(newProductBalances).forEach((productId: string) => {
            Object.keys(newProductBalances[productId]).filter((key: string) => key === accountId).forEach((_) => {
                if (!newAccountBalances[accountId].products[productId]) {
                    newAccountBalances[accountId].products[productId] = {
                        amountIn: 0,
                        amountOut: 0,
                        totalIn: 0,
                        totalOut: 0,
                    };
                }

                newAccountBalances[accountId].products[productId].amountIn += newProductBalances[productId][accountId].amountIn;
                newAccountBalances[accountId].products[productId].totalIn += newProductBalances[productId][accountId].totalIn;
            });
        });
    });

    group.accounts.forEach((account: UserAccount) => {
        const balance = newAccountBalances[account.id];
        if (balance) {
            account.balance = new Balance(balance.newBalance, 0, balance.products);
        } else {
            account.balance = new Balance(0, 0);
        }
    });

    group.products.forEach((product: Product) => {
        product.totalIn = product.restWorth;
        product.totalOut = 0;
        product.amountIn = product.stock;
        product.amountOut = 0;
    });

    console.log(newAccountBalances);
    console.log(group.accounts.map(acc => acc.balance));
    console.log(group.products);

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
            settle: newAccountBalances[accountId].settle
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

    const endFn = performance.now();

    console.log('calculateSettlement took ' + (endFn - startFn) + ' milliseconds.');

    // Update balances

    // Update productData

    // Save settlement to group
}

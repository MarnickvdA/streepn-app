import {Balance} from '@core/models';

export const shuffle = (array: any[]) => {
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
};

export interface AccountPayout {
    totalOut: number;
    products: {
        [productId: string]: {
            totalOut: number;
            amountOut: number;
        };
    };
}

/**
 * Calculate how the shared account should be splitted
 *
 * @param balance balance of the shared Account
 * @param count amount of payers
 */
export const calculatePayout = (balance: Balance, count: number): AccountPayout[] => {
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
                totalOut: number;
                amountOut: number;
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
};

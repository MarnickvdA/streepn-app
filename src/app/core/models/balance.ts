import {Account} from '@core/models/account';

/**
 * Helper interface for readability of the code within the Group class. Amount is the current balance, based on the totalIn and totalOut.
 */
export class Balance {
    totalIn: number;
    totalOut: number;
    products?: {
        [productId: string]: {
            totalIn: number,
            totalOut: number,
            amountIn: number,
            amountOut: number,
        }
    };

    static new() {
        return new Balance(0, 0);
    }

    constructor(totalIn: number, totalOut: number,
                products?: { [p: string]: { totalIn: number; totalOut: number; amountIn: number; amountOut: number } }) {
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.products = products;
    }

    get amount(): number {
        return this.totalIn - this.totalOut;
    }
}

export const balanceConverter = {
    toFirestore(balance: Balance) {
        return {
            totalIn: balance.totalIn,
            totalOut: balance.totalOut,
            products: balance.products,
        };
    }
};
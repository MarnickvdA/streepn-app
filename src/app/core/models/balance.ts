/**
 * Helper interface for readability of the code within the House class. Amount is the current balance, based on the totalIn and totalOut.
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

    constructor(totalIn: number, totalOut: number,
                products?: { [p: string]: { totalIn: number; totalOut: number; amountIn: number; amountOut: number } }) {
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.products = products;
    }

    get amount(): number {
        return this.totalIn - this.totalOut;
    }

    static new() {
        return new Balance(0, 0);
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

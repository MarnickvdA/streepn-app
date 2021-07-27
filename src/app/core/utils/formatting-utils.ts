export const getMoneyString = (money: number): string => Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: undefined,
    }).format(money / 100);

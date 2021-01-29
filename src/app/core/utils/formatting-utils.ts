export function getMoneyString(money: number): string {
    return Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: undefined,
    }).format(money / 100);
}

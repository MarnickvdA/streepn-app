export function getMoneyString(money: number): string {
    return Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: undefined,
    }).format(money / 100);
}

export function calculatePayout(totalCost: number, count: number): number[] {
    const payout = [];

    // Initial payout without distributing the remainder of the costs.
    for (let index = 0; index < count; index++) {
        payout.push(Math.floor(totalCost / count));
    }

    // Evenly adding the remainder and shuffling it for 'fairness'
    let remainder;
    let i;
    for (i = 0, remainder = totalCost % count; remainder > 0; i = (i + 1 % count), remainder--) {
        payout[i] += 1;
    }

    function shuffle(array: number[]) {
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

    return shuffle(payout);
}

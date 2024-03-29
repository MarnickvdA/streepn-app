/* eslint-disable no-bitwise */
import random from 'random';
import seedrandom from 'seedrandom';

export const idMap: { [seed: string]: string } = {};

export const toPastelColor = (seed?: string): string => {
    if (!seed || seed.length === 0) {
        return '#41B489';
    }

    if (idMap[seed]) {
        return idMap[seed];
    }

    random.use(seedrandom(seed));
    const hsl = `hsl(${random.int(0, 360)}, 70%, 80%)`;

    idMap[seed] = hsl;

    return hsl;
};

/* eslint-disable no-bitwise */
import random from 'random';
import seedrandom from 'seedrandom';

export const idMap: { [key: string]: string } = {};

export const toHSL = (obj: string): string => {
    if (idMap[obj]) {
        return idMap[obj];
    }

    if (obj.length === 0) {
        return '#41B489';
    }

    random.use(seedrandom(obj));
    const hsl = `hsl(${random.int(0, 360)}, 70%, 80%)`;

    idMap[obj] = hsl;

    return hsl;
};

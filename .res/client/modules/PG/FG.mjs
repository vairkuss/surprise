/* Function Generator */


export default class FG { // Function Generator

    constructor(points) {
        const matrix = points.map(([x, y], _, a) => {
            const keys = Array.from(a, (_, i) => {
                const exp = a.length - i;
                return x ** exp;
            });
            return keys.concat(y);
        });
        console.log("before", { points, matrix });
        for (let row = 1; row < matrix.length; row++) {
            const stair = row - 1;
            for (let cell = stair; cell < matrix[row].length; cell++) {
                const above = matrix[row - 1][cell];
                const stairValue = matrix[row][stair];
                matrix[row][cell] -= above * stairValue;
            }
        }
        this.keys = matrix.toReversed().reduce((keys, row) => {
            const y = row.pop();
            const toOtherSide = row.toReversed().reduce((sum, v, i) => {
                return sum + v * (keys[i] ?? 0);
            }, 0);
            keys.push(y - toOtherSide);
            console.log({ keys, y, toOtherSide });
            return keys;
        }, []);
        console.log("after", { matrix, keys: this.keys });
    }

    func(x) {
        console.debug(this.keys.reduce((sum, k, i) => {
            return `${k}${i ? "x^" + i : ''} + ` + sum;
        }));
        return this.keys.reduce((sum, k, i) => {
            return sum + k * (x ** i);
        }, 0);
    }
}


export class InOut extends FG {
    
    constructor() {
        super([
            [0.0, 0.00],
            [0.2, 0.75],
            [0.5, 0.90],
            [0.8, 0.75],
            [1.0, 0.00]
        ]);
    }
}

window.func = x => {
    console.debug("x = 2,\n", new InOut().func(0));
}

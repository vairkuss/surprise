/* Function Generator */


function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}


export class PA { // Polynomial Approximator 

    constructor(points) {
        const matrix = points.map(([x, y], _, a) => {
            const expos = a.map((_, i) => x ** i);
            return expos.toReversed().concat(y);
        });
        const sorted = matrix.reduce((sorted, _, i) => {
            const candidates = matrix.filter(row => {
                const clear = row.slice(i, -1).every(Boolean);
                const unique = !sorted.includes(row);
                return clear && unique;
            });
            if (!candidates.length) return sorted;
            for (let j = -2; -j <= matrix.length - i; j--) {
                candidates.sort((a, b) => a.at(j) - b.at(j));
            }
            return sorted.concat(candidates);
        }, []);
        for (let stair = 0; stair < sorted.length - 1; stair++) {
            for (let current = stair + 1; current < sorted.length; current++) {
                if (!sorted[current][stair]) continue;
                const k = sorted[current][stair] / sorted[stair][stair];
                for (let cell = stair; cell < sorted.length + 1; cell++) {
                    sorted[current][cell] -= sorted[stair][cell] * k;
                }
            }
        }
        this.keys = sorted.toReversed().reduce((keys, row) => {
            const y = row.pop();
            const k = row.at(-keys.length - 1);
            const toOtherSide = keys.reduce((sum, key, i) => {
                console.log("summing i of row:", { sum, key, row, i, factor: row.at(-i - 1) })
                return sum + key * row.at(-i - 1);
            }, 0);
            return keys.concat((y - toOtherSide) / k);
        }, []);
    }

    func(x) {
        return this.keys.reduce((sum, k, i) => {
            return sum + k * (x ** i);
        }, 0).toFixed(5);
    }
}


export default class FG {
    
    constructor(points) {
        this.__points = points;
    }
    
    get __randomised_points() {
        return Array.from(this.__points, ([x, y]) => {
            const pt1 = Math.sqrt(-2 * Math.log(Math.random()));
            const pt2 = Math.cos(2 * Math.PI * Math.random());
            const standartDirtribution = pt1 * pt2;
            const standartDeviation = 0.4;
            const normalised = standartDeviation * standartDirtribution;
            return [x, y + normalised];
        });
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

/* Function Generator */


export class PA { // Polynomial Approximator 

    constructor(points) {
        const matrix = this.__pointsToMatrix(points);
        const sorted = this.__sortMatrix(matrix);
        const calculated = this.__gaussianAlg(sorted);
        this.factors = this.__estimateFactors(calculated);
    }

    __pointsToMatrix(points) {
        return points.map(([x, y], _, a) => {
            const expos = a.map((_, i) => x ** i);
            return expos.toReversed().concat(y);
        });
    }
    
    __sortMatrix(matrix) {
        return matrix.reduce((sorted, _, i) => {
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
    }
    
    __gaussianAlg(matrix) {
        for (let stair = 0; stair < matrix.length - 1; stair++) {
            for (let current = stair + 1; current < matrix.length; current++) {
                if (!matrix[current][stair]) continue;
                const k = matrix[current][stair] / matrix[stair][stair];
                for (let cell = stair; cell < matrix.length + 1; cell++) {
                    matrix[current][cell] -= matrix[stair][cell] * k;
                }
            }
        }
        return matrix;
    }
    
    __estimateFactors(matrix) {
        return matrix.toReversed().reduce((keys, row) => {
            const y = row.pop();
            const k = row.at(-keys.length - 1);
            const toOtherSide = keys.reduce((sum, key, i) => {
                return sum + key * row.at(-i - 1);
            }, 0);
            return keys.concat((y - toOtherSide) / k);
        }, []);
    }

    f(x) {
        const sum = this.factors.reduce((sum, k, i) => {
            return sum + k * (x ** i);
        }, 0);
        console.log(sum);
        return parseFloat(sum.toFixed(5));
    }
}


export default class FG {
    
    constructor(points) {
        this.__points = points;
        const pa = new PA(points);
        this.f = pa.f.bind(pa);
    }
    
    get __biased() {
        return Array.from(this.__points, ([x, y]) => {
            // Z = sqrt(-2 * ln(U1)) * cos(2 * PI * U2)
            const pt1 = Math.sqrt(-2 * Math.log(Math.random()));
            const pt2 = Math.cos(2 * Math.PI * Math.random());
            const stDistr = pt1 * pt2;
            const stDev = 0.2;
            // N ~ µ + σ * Z
            const normalisedBias = 0 + stDev * stDistr;
            return [x, y + normalisedBias];
        });
    }

    get randF() {
        const biased = this.__biased;
        const pa = new PA(biased);
        console.log({ biased, pa, fg: this });
        return pa.f.bind(pa);
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


const io = new InOut();
window.f = x => io.f(x);
window.rf = x => io.randF(x);

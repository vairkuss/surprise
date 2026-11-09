/* Enemies */

import T from "./T.mjs";
import { Tile } from "./DF.mjs";


class E extends T { // Enemy
    
    constructor(cords, tact) {
        super(cords);
        this.tact = tact;
    }
    
    draw(meta, color="#b00") {
        super.draw(meta,
            new Tile(color, this.cords, .2, -1)
        );
    }
    
    move(gridSize, dir) {
        this.cords = this.cords.map((v, i) => {
            return (v + dir[i] + gridSize[i]) % gridSize[i];
        });
    }
}


class SE extends E { // Streamlined Enemy
    
    constructor(cords, tact, pattern) {
        super(cords, tact);
        this.dir = [pattern.x, pattern.y];
    }
    move(gridSize) { super.move(gridSize, this.dir) }
    
    bounce(gridSize) {
        [
            !this.x || this.x + 1 === gridSize[0],
            !this.y || this.y + 1 === gridSize[1]
        ].forEach((v, i) => { if (v) this.dir[i] *= -1 });
    }

}


export class Pawn extends SE{
    
    constructor(cords, pattern) {
        pattern = Object.assign({x: 0, y: 0}, pattern);
        super(cords, 2/4, pattern);
    }
    
    draw(meta) { super.draw(meta, "#60f") }
}


export class Bishop extends SE {

    constructor(cords, pattern) {
        return new SE(cords, 1/4, pattern);
    }
    
    draw(meta) { super.draw(meta, "#308") }
}


export default class ES { // Enemy Spawner
    
    static enemies = [];

    static clear(gridSize) {
        this.enemies = this.enemies.filter(enemy => {
            return enemy.cords.some((v, i) => v < 0 || v >= gridSize[i]);
        });
    }

    static atEdge(outerTiles, enemy) {
        const outOfBounds = []
    }
}

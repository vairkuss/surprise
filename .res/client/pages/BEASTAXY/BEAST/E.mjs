/* Enemies */

import DF from "./DF.mjs";
import T from "./T.mjs";


class E extends T { // Enemy
    
    constructor(cords, tickFreq) {
        super(cords);
        this.tick = tick;
    }
    
    draw(ctx, tileSize, color="#b00") {
        super.draw(ctx, color,
            DF.tile(ctx, tileSize, this.cords, .2, -1)
        );
    }
    
    move(gridSize, vector) {
        this.cords = this.cords.map((v, i) => v + vector[i]);
    }
}


class SE extends E { // Streamlined Enemy
    
    constructor(cords, vector) {
        super(cords, tick);
        this.vector = vector;
    }
    
    draw(ctx, tileSize) { super.draw(ctx, tileSize, "#60f") }
    move(gridSize) { super.move(gridSize, this.vector) }
    
    bounce(gridSize) {
        [
            !this.x || this.x + 1 === gridSize[0],
            !this.y || this.y + 1 === gridSize[1]
        ].forEach((v, i) => { if (v) this.vector[i] *= -1 });
    }
}


export default class ES { // Enemy Spawner
    
    static pawn(cords, cord, dir) {
        const vector = [0, 0];
        vector[cord] = dir;
        return new StreamlinedEnemy(cords, 2/4, vector);
    }
    static bishop(cords, dir) {
        const vector = [[], [], [], []][dir];
        return new StreamlinedEnemy(cords, 1/4, vector);
    }
}

/* Snake Parts */

import T from "./T.mjs";
import { Tile } from "./DF.mjs";


export class DP extends T { // Dash Preview
    
    constructor(cords, danger) {
        super(cords);
        this.danger = danger;
    }
    
    draw(meta) {
        const stroke = this.danger ? "#f00" : "#0ff";
        const fill = this.danger ? "#f00" : "transparent";
        super.draw(meta,
            new Tile(stroke, this.cords, 0.05),
            new Tile(fill, this.cords)
        );
    }
}


export default class S extends T { // Snake
    
    static stepDist = 1;
    static dashDist = 3;
    
    constructor(cords, dir) {
        super(cords);
        this.dir = dir;
        this.tail = [];
        this.sprite = 0;
        this.sprites = data.beast.canvas.S.run
        this.dashing = false;
    }

    get dashing() {
        const buffer = this.__dashing;
        this.__dashing = false;
        return buffer;
    }
    set dashing(dashing) {
        this.__dashing = dashing;
    }
    
    get score() { return this.tail.length }

    get dirKey() {
        if (this.dir[1] < 0) return 'w';
        if (this.dir[0] > 0) return 'd';
        if (this.dir[1] > 0) return 's';
        if (this.dir[0] < 0) return 'a';
    }
    
    draw(meta) {
        this.tail.toReversed().forEach(seg => seg.draw(meta));
        super.draw(meta,
            new Tile("#af6", this.cords),
            new Tile("#392", this.cords, 0.05, -1)
        );
    }
    
    next(gridSize, dist) {
        const step = dist ?? this.dashing ? S.dashDist : S.stepDist;
        return this.cords.map((v, i) => {
            return (v + this.dir[i] * step + gridSize[i]) % gridSize[i];
        });
    }
    
    move(gridSize) {
        this.tail.forEach((seg, i, a) => seg.cords = i ? a[i - 1].cords : this.cords);
        this.cords = this.next(gridSize);
    }
}

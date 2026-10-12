/* Tiles */

import DF from "./DF.mjs";


export default class T { // Tile
    
    constructor(cords) { this.cords = cords }
    get cords() { return [this.x, this.y] }
    set cords(cords) { [this.x, this.y] = cords }
    get area() {
        return [...Array(3 * 3)].map((_, i) => [
            this.x - (i % 3) + 1,
            this.y - Math.trunc(i / 3) + 1
        ]);
    }
    
    draw(ctx, color, strokeFunc, fillFunc, bColor) {
        if (fillFunc != null) {
            ctx.fillStyle = color;
            fillFunc();
        }
        ctx.strokeStyle = bColor ?? color;
        strokeFunc();
    }
}

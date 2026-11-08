/* Apple */

import T from "./T.mjs";
import { Circle, Tile } from "./DF.mjs";


export default class A extends T { // Apple
    
    constructor(cords) {
        super(cords);
        this.active = false;
        const randDeg = () => Math.trunc(Math.random() * 360);
        const randPercent = () => Math.trunc(Math.random() * 35 + 50);
        this.color = `hsl(${randDeg()} ${randPercent()}% ${randPercent()}%)`;
        this.bColor = `hsl(from ${this.color} h s calc((100 - l) * 1%))`;
    }
    
    draw(meta) {
        if (this.active) {
            super.draw(meta,
                new Tile(this.color, this.cords, 0, -1),
                new Tile(this.bColor, this.cords, 0.15, -1)
            );
        } else {
            super.draw(meta,
                new Circle(this.color, this.cords, 1, 0, -1),
                new Circle(this.bColor, this.cords, 1, 0.15, -1)
            );
        }
    }
}
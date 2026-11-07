/* Apple */

import T from "./T.mjs";
import { Circle } from "./DF.mjs";


export default class A extends T { // Apple
    
    constructor(cords) {
        super(cords);
        this.appended = 0;
        const randDeg = () => Math.trunc(Math.random() * 360);
        const randPercent = () => Math.trunc(Math.random() * 50 + 50);
        this.color = `hsl(${randDeg()} ${randPercent()}% ${randPercent()}%)`;
        this.bColor = `hsl(from ${this.color} calc(h + 180) s calc((100 - l) * 1%))`;
    }
    
    draw(meta) {
        console.log("Acords:",this.cords)
        super.draw(meta,
            new Circle(this.bColor, this.cords, 1, 1 -1),
            new Circle(this.color, this.cords, 1, 0, -1)
        );
    }
    
    appendTo(arr) {
        this.appended = 1;
        arr.unshift(this);
    }
}
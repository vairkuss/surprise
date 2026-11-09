/* Drawing Function */


export default class Figure {

    constructor(color, cords, b=0, mode=0, bias=[0, 0]) {
        this.color = color;
        this.b = b;
        this.bBias = 0; // b * mode;
        [this.x, this.y] = cords;
        this.bias = bias;
    }
}


export class Rect extends Figure {

    constructor(color, cords, size, radii, b, mode, bias) {
        super(color, cords, b, mode, bias);
        [this.w, this.h] = size;
        this.radii = radii ?? 0;
    }

    draw(ctx, tileSize) {
        ctx.lineWidth = tileSize * this.b;
        ctx.beginPath();
        ctx.roundRect(
            tileSize * (this.x + (1 - this.w) / 2 + this.bBias + this.bias[0]),
            tileSize * (this.y + (1 - this.h) / 2 + this.bBias + this.bias[1]),
            tileSize * (this.w - this.bBias),
            tileSize * (this.h - this.bBias),
            this.radii.constructor.name === "Array"
                ? this.radii.map(r => r * tileSize)
                : this.radii * tileSize
        );
        ctx[this.b ? "stroke" : "fill"]();
    }
}


export class Square extends Rect{
    
    constructor(color, cords, w, radii, b, mode, bias) {
        super(color, cords, [w, w], radii, b, mode, bias);
    }
}


export class Circle extends Square {
    constructor(color, cords, r, b, mode, bias) {
        super(color, cords, r, r, b, mode, bias);
    }
}


export class Tile extends Square {
    
    constructor(color, cords, b, mode, bias) {
        super(color, cords, 1, 0, b, mode, bias);
    }
}

export class Side extends Figure {
    constructor(color, cords, dir, b, mode=-1, bias) {
        super(color, cords, b, mode, bias);
        this.dir = dir;
        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(corner => {
            return corner.map((v, i) => cords[i] + v);
        });
        this.begin = corners[dir];
        this.end = corners[(dir + 1) % 4];
    }

    draw(ctx, tileSize) {
        if (this.dir < 0) return;
        const calc = arr => arr.map((v, i) => (v + this.bias[i]) * tileSize + (-this.bBias) ** v);
        const [x1, y1] = calc(this.begin);
        const [x2, y2] = calc(this.end);
        ctx.fillStyle = "transparent";
        ctx.lineWidth = tileSize * this.b;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

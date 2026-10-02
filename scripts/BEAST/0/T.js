/* Tile */

class T { // Tile
    
    constructor(x, y, color="#000", borderWidth=0, borderColor=null, fill=1) {
        this.x = x;
        this.y = y;
        this.area = (gridSize) => [...Array(3 * 3)].map((v, i) => [
            this.x - (i % 3) + 1,
            this.y - Math.trunc(i / 3) + 1
        ]);
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor ?? color;
        this.fill = fill;
    }
    
    get cords() { return [this.x, this.y] }
    
    draw(ctx, fillFunc, strokeFunc, color, borderColor, borderWidth) {
        if (this.fill) {
            ctx.fillStyle =  color ?? this.color;
            fillFunc();
        }
        ctx.lineWidth = borderWidth ?? this.borderWidth;
        ctx.strokeStyle = borderColor ?? this.borderColor;
        strokeFunc();
        ctx.lineWidth = 0;
    }
}
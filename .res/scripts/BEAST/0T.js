/* Tiles */

class DF { // Draw Functions
    
    static rect(ctx, tileSize, [x, y], [w, h], b=0, mode=0) {
        const bBias = tileSize * b * mode / 2;
        return () => {
            ctx.lineWidth = tileSize * b;
            (b ? ctx.strokeRect : ctx.fillRect)(
                tileSize * (x + (1 - w) / 2) + bBias,
                tileSize * (y + (1 - h) / 2) + bBias,
                tileSize * w - bBias,
                tileSize * h - bBias
            );
        }
    }
    
    static square(ctx, tileSize, cords, w, b, mode) {
        return this.rect(ctx, tileSize, cords, [w, w], b, mode);
    }
    
    static tile(ctx, tileSize, cords, b, mode) {
        return this.square(ctx, tileSize, cords, 1, b, mode);
    }
    
    static circle(ctx, tileSize, [x, y], [bx, by], r, b=0, mode=0) {
        const bBias = tileSize * b * mode / 2;
        return () => {
            ctx.lineWidth = tileSize * b;
            ctx.beginPath();
            ctx.arc(
                tileSize * (x + bx + .5),
                tileSize * (y + by + .5),
                tileSize * r + bBias,
                0, Math.PI * 2
            );
            (b ? ctx.stroke : ctx.fill)();
        }
    }
    
    static side(ctx, tileSize, cords, dir, b, mode=-1) {
        const bBias = tileSize * b * mode / 2;
        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(corner => {
            return corner.map((v, i) => tileSize * (cords[i] + v) + (v ? -bBias : bBias));
        });
        const [x1, y1] = corners[dir];
        const [x2, y2] = corners[(dir + 1) % 4];
        return () => {
            ctx.lineWidth = tileSize * b;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}


class T { // Tile
    
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


class BET extends T { // Board Edge Tile
    
    constructor(cords) {
        super(cords);
    }
    
    draw(ctx, tileSize, gridSize, danger) {
        [
            !this.y,
            this.x + 1 === gridSize[0],
            this.y + 1 === gridSize[1],
            !this.x
        ].forEach((dirTerm, dir) => {
            if (dirTerm && !danger.includes(dir)) {
                super.draw(ctx, "#fff",
                    DF.side(ctx, tileSize, this.cords, dir, 0.2)
                );
            }
        });
    }
}

/* Draw Form */

class DF { // Draw Form

    static NULL () {};
    
    static rect (ctx, tileSize, x, y, sizeX, sizeY, fill) {
        return function () {
            let args = [
                (x + (1 - sizeX) / 2) * tileSize,
                (y + (1 - sizeY) / 2) * tileSize,
                sizeX * tileSize,
                sizeY * tileSize
            ];
            if (fill) {ctx.fillRect(...args)} else {ctx.strokeRect(...args)}
        }
    }
    
    static square (ctx, tileSize, x, y, size, fill) {
        return this.rect(ctx, tileSize, x, y, size, size, fill);
    }
    
    static tile (ctx, tileSize, x, y, fill) {
        return this.square(ctx, tileSize, x, y, 1, fill);
    }
    
    static circle (ctx, tileSize, x, y, d, fill) {
        return function () {
            ctx.beginPath();
            ctx.arc(
                (x + 0.5) * tileSize,
                (y + 0.5) * tileSize,
                d / 2 * tileSize,
                0,
                Math.PI * 2
            );
            if (fill) {ctx.fill()} else {ctx.stroke()}
        }
    }
    
    static side (ctx, tileSize, x, y, w, direction) {
        return function () {
            let corners = [...Array(4)].map(
                (_, i) => [x, y].map(
                    (v, j) => Math.trunc((i - j + 1) / 2) % 2
                        ? (v + 1) * tileSize //- w / 2
                        : v * tileSize //+ w / 2
                )
            );
            ctx.beginPath();
            ctx.moveTo(...corners[direction]);
            ctx.lineTo(...corners[(direction + 1) % 4]);
            ctx.stroke();
        }
    }
}
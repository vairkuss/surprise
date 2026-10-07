/* Snake Parts */

class DP extends T { // Dash Preview
    
    constructor(cords, danger) {
        super(cords);
        this.danger = danger;
    }
    
    draw(ctx, tileSize) {
        super.draw(ctx, this.danger ? "#f00" : "#0ff",
            DF.tile(ctx, tileSize, this.cords, 0.05),
            this.danger ? DF.tile(ctx, tileSize, this.cords) : () => {}
        );
    }
}


class S extends T { // Snake
    
    static dashDist = 3;
    static stepDist = 1;
    
    constructor(cords, dir) {
        super(cords);
        this.dir = dir;
        this.dashing = 0;
        this.tail = [];
    }
    
    get score() { return this.tail.length }
    
    draw(ctx, tileSize) {
        this.tail.toReversed().forEach(seg => seg.draw(ctx, tileSize));
        super.draw(ctx, "#5f2"
            DF.tile(ctx, tileSize, this.cords, 0.05, -1),
            DF.tile(ctx, tileSize, this.cords), "#af6"
        );
    }
    
    next(gridSize, dist) {
        const bias = dist ?? this.dashing * S.dashDist || S.stepDist;
        return this.cords.map((v, i) => {
            return (v + this.dir[i] * bias + gridSize[i]) % gridSize[i];
        });
    }
    
    move(gridSize) {
        this.tail.forEach((chip, i, a) => chip.cords = i ? a[i - 1].cords : this.cords);
        this.cords = this.next(gridSize);
    }
}

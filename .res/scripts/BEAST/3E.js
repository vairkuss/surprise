/* Enemies */

class E extends T { // Enemy
    
    constructor(cords, tickFreq, color="#b00") {
        super(startX, startY, color, borderWidth, borderColor, fill);
        this.tickFreq = tickFreq;
    }
    
    draw(ctx, tileSize) {
        super.draw(
            
        );
    }
    
    move(gridSize) {
        this.cords = this.next(gridSize);
    }
}


class SE extends E { // Streamlined Enemy
    
    constructor(startX, startY, tickTiming, direction, color="#60f") {
        super(startX, startY, tickTiming, color);
        this.direction = direction;
        this.next = gridSize => this.cords().map(
            (v, i) => v + this.direction[i]
        );
    }
    
    bounce (gridSize) {
        [
            !this.x || this.x + 1 === gridSize[0],
            !this.y || this.y + 1 === gridSize[1]
        ].forEach(
            (v, i) => {
                if (v) { this.direction[i] *= -1 }
            }
        );
    }
}


class ES { // Enemy Spawner
    static pawn (startX, startY, direction) {
        return new StreamlinedEnemy(startX, startY, 2/4, direction);
    }
}

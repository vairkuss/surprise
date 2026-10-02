class DPT extends T { // Dash Preview Tile
    
    constructor(x, y, danger) {
        let color = danger ? "#f00" : "#0ff";
        super(x, y, color);
    }
    
    draw(ctx, tileSize) {
        super.draw(ctx,
            DF.tile(ctx, tileSize, this.x, this.y, 1),
            DF.NULL
        );
    }
}

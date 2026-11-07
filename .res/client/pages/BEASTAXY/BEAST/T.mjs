/* Tiles */


export default class T { // Tile
    
    constructor(cords) { this.cords = cords }
    get cords() { return [this.x, this.y] }
    set cords(cords) { [this.x, this.y] = cords }
    get area() {
        return Array.from({ length: 3 * 3 }, (_, i) => [
            this.x - (i % 3) + 1,
            this.y - Math.trunc(i / 3) + 1
        ]);
    }
    
    draw([ctx, tileSize], ...dfs) {
        dfs?.forEach((df, i) => {
            const draw = df.b ? "stroke" : "fill";
            ctx[`${draw}Style`] = df.color; 
            df.draw(ctx, tileSize);
        })
    }
}

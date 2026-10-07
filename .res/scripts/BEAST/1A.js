/* Apple */

class A extends T { // Apple
    
    constructor(cords) {
        const randDeg = () => Math.random() * 360;
        const randPercent = () => Math.random() * 100;
        const color = `hsl(${randDeg()} ${randPercent()}% ${randPercent()}%)`;
        const bColor = `hsl(from ${color} calc(h + 180) s calc(100% - l))`;
        super(cords, color, 2, bColor);
        this.appended = 0;
    }
    
    draw(ctx, tileSize) {
        super.draw(ctx,
            DF.circle(ctx, tileSize, this.cords, 1, 1),
            DF.circle(ctx, tileSize, this.cords, [0, 0])
        );
    }
    
    appendTo(arr) {
        this.appended = 1;
        arr.append(this);
    }
}
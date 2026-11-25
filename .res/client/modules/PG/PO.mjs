/* Particle Object */


export default class PO {
    
    constructor(config) {
        this.living = 0;
        this.life = setInterval(() => {
            this.living += 0.1;
        }, this.config.lifespan);
        this.config = config;
    }

    move() {
        this.config.x += Math.cos(this.config.vel);
        this.config.y -= Math.sin(this.config.vel);
        this.config.vel += this.config.a(this.living);
    }
    
    draw() {
        if (this.config.drawFunc) {
            this.config.drawFunc.call(this.config);
        };
        
    }

    update() {
        this.move();
        this.draw();
    }
}

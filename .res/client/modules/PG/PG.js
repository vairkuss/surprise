/* Particle Generator */

import PO from "./PO.mjs";
import PF from "./PF.mjs";


export default class PG { // Particle Generator
    
    static canvas = document.querySelector("#particles");
    static ctx = this.canvas.getContext("2d");
    static generators = [];

    static get w() {
        this.canvas.getAttribute("width");
    }
    
    static get h() {
        this.canvas.getAttribute("height");
    }

    static pause() {
        if (this.interval == null) {
            this.interval = setInterval(() => {
                this.generators.forEach(pg => pg.render());
            }, 1/60 * 1000);
        } else {
            clearInterval(this.interval);
            this.interval = null;    
        }
    }

    static init() {
        window.addPG = config => new PG(config);
    }
    
    constructor(config) {
        PG.generators.push(this);
        this.config = config;
        this.particles = [];
    }
    
    spawn() {
        const po = new PO(this.config);
        this.particles.push(po);
        setTimeout(() => {
            poId = this.particles.findIndex(po);
            if (poId >= 0) {
                this.particles.splice(poId, 1);
            }
        }, this.config.lifespan * 1000);
    }
    
    render() {
        this.particles.forEach(particle => {
            particle.draw();
        });
    }
    
    remove() {
        const pgId = this.generators.findIndex(x => x === pg);
        if (pgId >= 0) {
            this.generators.splice(pgId, 1);
        }
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(PG);
} else PG.init();

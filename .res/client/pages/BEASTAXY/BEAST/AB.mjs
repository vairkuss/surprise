/* Action Buttons */

import SL from "./SL.mjs"


export default class AB { // Action Button
    
    constructor(el, func, cooldown, sprites) {
        this.el = el;
        el.addEventListener("contextmenu", e => e.preventDefault(), 1)
        el.addEventListener("click", e => {
            e.preventDefault();
            if (this.interval != null) {
                func();
                disable(cooldown);
            }
        }, 1);
        const sprites = SL.beast.B[sprites];
        [this.inactive] = sprites.splice(0, 1);
        this.sprites = sprites;
        this.active = 0;
        disable(5);
    }
    
    disable(s) {
        clearInterval(this.interval);
        this.interval = null;
        this.el.src = this.inactive;
        setTimeout(() => this.enable(), s * 1000);
    }
    
    enable() {
        this.interval = setInterval(() => {
            this.el.src = this.sprites[this.active];
            this.active++;
            this.active %= this.sprites.length;
        }, 100)
    }
}

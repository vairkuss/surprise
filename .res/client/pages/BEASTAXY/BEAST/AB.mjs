/* Action Button */


export default class AB { // Action Button
    
    constructor(id, func, animFps, cooldown, firstCooldown = 0) {
        this.el = document.getElementById(id);
        this.el.addEventListener("contextmenu", e => e.preventDefault(), true);
        this.el.addEventListener("click", e => {
            e.preventDefault();
            if (this.interval != null) {
                func();
                this.disable();
            }
        }, true);
        this.animFps = animFps;
        this.cooldown = cooldown;
        [this.default, ...this.sprites] = Object.values(data.beast.ui[id]);
        this.active = 0;
        this.disable(firstCooldown);
    }
    
    enable() {
        this.interval = setInterval(() => {
            this.el.src = this.sprites[this.active++];
            this.active %= this.sprites.length;
        }, 1000 / this.animFps);
    }
    
    disable(s = this.cooldown) {
        clearInterval(this.interval);
        this.interval = null;
        this.el.src = this.default;
        if (s) setTimeout(() => this.enable(), s * 1000);
    }
}

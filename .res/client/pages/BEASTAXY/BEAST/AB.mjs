/* Action Button */


export default class AB { // Action Button
    
    constructor(id, func, animFps, cooldown) {
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
        [this.default, ...this.sprites] = Object.values(beast.ui[id]);
        this.active = 0;
        this.frozen = false;
    }
    
    enable() {
        this.interval = setInterval(() => {
            this.el.src = this.sprites[this.active++];
            this.active %= this.sprites.length;
        }, 1000 / this.animFps);
    }
    
    disable(s=this.cooldown) {
        clearTimeout(this.timeout);
        clearInterval(this.interval);
        this.interval = null;
        this.el.src = this.default;
        if (s) {
            const freezeSign = [`abFreeze:${this.el.id}`, () => {
                this.frozen = true;
            }, { once: true }];
            this.el.addEventListener(...freezeSign);
            let timer = 0;
            this.timeout = setInterval(() => {
                if (timer >= s * 60) {
                    clearInterval(this.timeout);
                    this.enable();
                    this.el.removeEventListener(...freezeSign);
                }
                timer += !this.frozen;
            }, 1/60 * 1000);
        }
    }
}

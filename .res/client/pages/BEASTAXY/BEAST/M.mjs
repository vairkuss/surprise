/* Menu */


export default class Menu {

    static #menu = document.querySelector("#menu");
    static running = {};

    static get menu() {
        this.#menu.classList.remove("hidden");
        return this.#menu;
    }

    static playAnim(el, name, callback, fps=12) {
        const sprites = Object.values(data.cinematics[name]);
        if (!callback) {
            let i = 0;
            const interval = setTimeout(() => {
                el.src = sprites[i++];
                i %= sprites.length;
            }, 1000 / fps);
            this.running[id] = interval;
        } else {
            for (let i = sprites.length; i > 0; i--) {
                setTimeout(() => {
                    if (i) {
                        el.src = sprites[i];
                    } else {
                        callback();
                    }
                }, i * 1000 / fps);
            }
        }
    }
    
    static stop(id) {
        clearInterval(this.running[id]);
        delete this.running[id];
    }

    static stopAll() {
        for (const id in this.running) {
            this.stop(id);
        }
    }

    static gameOver(reason) {
        const el = this.menu.querySelector("#gameover");
        el.classList.remove("hidden");
        const buttons = el.querySelector(".hbox");
        this.playAnim(el, reason, () => buttons.classList.remove("hidden"));
    }
}

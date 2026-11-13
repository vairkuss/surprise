/* Menu */


export default class Menu {
    
    static menu = document.getElementById("menu");
    static frame = document.getElementById("frame");
    static lableText = document.querySelector(".lable.text").appendChild(new Text());
    static current = null;
    static running = {};

    static playAnim(el, name, callback, fps=12) {
        const frames = Object.values(data.beast.cinematics[name]);
        if (!callback) {
            let i = 0;
            const interval = setTimeout(() => {
                el.src = frames[i++];
                i %= frames.length;
            }, 1000 / fps);
            this.running[id] = interval;
        } else {
            for (let i = frames.length; i > 0; i--) {
                setTimeout(() => {
                    if (i) {
                        el.src = frames[i];
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

    static load(cinematic, lable, btnSet) {
        this.lableText.nodeValue = lable;
        this.menu.classList.remove("hidden");
        const buttons = document.querySelector(`#${btnSet}`);
        [...buttons.children].forEach(btn => {
            assignBtnFunc(btn, () => buttons.classList.add("hidden"));
        });
        setTimeout(() => {
            this.frame.classList.remove("hidden");
            this.playAnim(frame, cinematic, () => buttons.classList.remove("hidden"));
        }, 0.4 * 1000);
    }

    static hide() {
        this.menu.classList.add("hidden");
    }
}

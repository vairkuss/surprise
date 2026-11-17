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
            for (let i = frames.length - 1; i >= 0; i--) {
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

    static #unload(signature, btns) {
        [...btns.children].forEach(btn => {
            btn.removeEventListener("pointerdown", signature, true);
        });
        btns.classList.add("hidden");
        btns.parentElement.classList.add("hidden");
        btns.parentElement.parentElement.classList.add("hidden");
    }

    static load(cinematic, lable, btnSet) {
        this.lableText.nodeValue = lable;
        this.menu.classList.remove("hidden");
        const btns = document.querySelector(`#${btnSet}`);
        const unload = () => this.#unload(unload, btns);
        [...btns.children].forEach(btn => {
            assignBtnFunc(btn, () => btns.classList.add("hidden"));
            btn.addEventListener("pointerdown", unload, true);
        });
        setTimeout(() => {
            this.frame.classList.remove("hidden");
            this.playAnim(frame, cinematic, () => {
                btns.classList.remove("hidden")
            });
        }, 0.4 * 1000);
    }

    static hide() {
        this.menu.classList.add("hidden");
    }
}

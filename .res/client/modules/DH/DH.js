/* Dialogue Handler */

import AF from "./AF.mjs"
import CO from "./CO.mjs";
import SB from "./SB.mjs"
import CH from "./CH.mjs"


class DH { // Dialogue Handler
    
    static #current = null;
    static #cursor = {};
    static #page = null;
    static #clicked = null;
    static get ready() {
        return this.#page == null;
    }
    static get cursor() {
        return JSON.parse(JSON.stringify(this.#cursor));
    }
    
    static #updateCursor({ name }, value, relative) {
        const cursor = (this.#cursor[name] ?? 0) * relative + value;
        this.#cursor[name] = Math.min(cursor, this.#current[name].length - 1);
    }
    
    static #readDialogue({ name }) {
        this.#page = this.#page ?? 0;
        this.#readPage(this.#current[name]?.at(this.#cursor[name])?.at(this.#page));
        signal.addEventListener("chChosen", e => {
            SB.remove();
            const { detail: chosen } = e;
            if (chosen?.constructor.name === "Array") {
                const [csv, page] = chosen;
                this.#page = page;
                const [charName, rawCursor] = csv.split(":");
                if (charName !== name) {
                    this.#updateCursor(name, 1, 1);
                }
                if (!Number.isNaN(rawCursor)) {
                    const cursor = parseInt(rawCursor);
                    this.#updateCursor(charName, cursor, 0);
                }
                return this.#readDialogue(charName);
            } else if (chosen < 0) {
                char.pat();
                this.#page = null;
            } else {
                this.#page = chosen;
            }
            
            setTimeout(() => {
                if (this.#page != null) {
                    this.#readDialogue(char);
                } else {
                    this.#updateCursor(char, 1, 1);
                }
            }, 400);
        });
    }
    
    static #readPage({ before, replicas, choices }) {
        this.#clicked = 0;
        
        before?.forEach(async ({ id, animation, pose, pause }) => {
            CO.play(id, animation, pose, pause);
        });
        
        replicas?.forEach(({ id, text, animation, pose, pause }, i) => {
            signal.addEventListener("replica" + i, () => {
                const char = document.getElementById(id);
                CO.blink(id);
                CO.play(id, animation, pose, pause).then(() => SB.hit());
                new SB(char, text, pose);
            }, { once: 1 });
        });
        
        const passLast = typeof choices === "number" ? choices >= 0 : choices != null;
        AF.repeatOnClicksUntill(true,
            () => (this.#clicked >= replicas.length - passLast) && SB.active == null,
            () => {
                if (SB.active == null) {
                    signal.dispatchEvent(new Event("replica" + this.#clicked));
                    this.#clicked++;
                }
            },
            () => CH.setChoice(choices)
        );
    }
    
    static init() {
        if (this.#current != null) return;
        
        this.#current = data.replicas;
        this.#cursor = data.save.cursor[data.page] ?? {};
        
        document.querySelectorAll(".character").forEach(el => {
            const char = new CO(el);
            el.addEventListener("pointerout", () => {
                if (this.ready) char.idle;
            });
            el.addEventListener("pointerover", () => {
                if (this.ready) char.hover();
            });
            el.addEventListener("click", () => {
                if (this.ready) this.#readDialogue(char);
            });
        });
        
        root.appendChild(CH.cc.base);
        
        CH.cc.chip.addEventListener("pointerdown", e => {
            const chosen = CH.chosen !== undefined;
            const chipHidden = CH.cc.chip.matches("hidden");
            if (chosen && SB.active == null || chipHidden) return;
            e.preventDefault();
            const chipStyle = getComputedStyle(CH.cc.chip);
            const x = parseFloat(chipStyle.left);
            const y = parseFloat(chipStyle.top);
            CH.cc.dp = { x: e.screenX - x, y: e.screenY - y }
            CH.cc.addClass("active");
            CH.cm.show(vault);
        }, true);
        
        document.body.addEventListener("pointermove", e => CH.dragChip(e));
        document.body.addEventListener("pointerup", e => CH.makeChoice(e));
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => DH.init());
} else DH.init();

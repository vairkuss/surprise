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
    static get ready() { return this.#page == null }
    static get cursor() { return JSON.parse(JSON.stringify(this.#cursor)) }
    
    static #updateCursor({ name }, value, relative) {
        const cursor = (this.#cursor[char] ?? 0) * relative + value;
        this.#cursor[char] = Math.min(cursor, this.#current[name].length - 1);
        window.data.save.cursor = this.#cursor;
    }
    
    static #readDialogue(char) {
        this.#page = this.#page ?? 0;
        this.#readPage(this.#current[char]?.at(this.#cursor[char])?.at(this.#page));
        this.onPageComplete(() => {
            if (this.#page?.constructor.name === "Array") {
                const [csv, page] = this.#page;
                this.#page = page;
                const [charName, cursor] = csv.split(":");
                if (charName !== char) { this.#updateCursor(char, 1, 1) }
                if (cursor) { this.#updateCursor(charName, parseInt(cursor), 0) }
                return this.#readDialogue(charName);
            } else if (this.#page < 0) {
                const action = [
                    () => char.pat(),
                    () => char.wag()
                ].at(~this.#page);
                if (action != null) action();
                this.#page = null;
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
            AH.play(id, animation, pose, pause);
        });
        
        replicas?.forEach(async ({ id, text, animation, pose, pause }, i) => {
            AF.holdUntill(30, () => this.#clicked === i, () => {
                const char = document.getElementById(id);
                AH.blink(id);
                AH.play(id, animation, pose, pause).then(() => SB.hit());
                new SB(char, text, pose);
            });
        });
        
        const passLast = typeof choices === "number" ? choices >= 0 : choices != null;
        AF.repeatOnClicksUntill(true,
            () => this.#clicked >= replicas.length - passLast && SB.active == null,
            () => this.#clicked += SB.active == null,
            () => {
                CH.setChoice(choices);
                CH.onChosen(() => {
                    SB.onFinished(() => {
                        SB.remove();
                        this.#page = CH.chosen;
                        this.#clicked = null;
                        this.onPageComplete();
                    });
                });
            }
        );
    }
    
    static init() {
        if (this.#current != null) return;
        
        this.#current = window.data.replicas;
        this.#cursor = window.data.save.cursor;
        
        document.querySelectorAll(".character").forEach(el => {
            
            const char = new CO(el);
            
            el.addEventListener("pointerout", () => {
                if (this.ready) char.idle;
            });
            el.addEventListener("pointerover", () => {
                if (this.ready) char.hover();
            });
            el.addEventListener("contextmenu", e => {
                e.preventDefault();
            });
            el.addEventListener("click", () => {
                if (this.ready) this.#readDialogue(char);
            });
        });
        
        document.body.appendChild(CH.cc.base);
        
        CH.cc.chip.addEventListener("pointerdown", e => {
            const chosen = CH.chosen !== undefined;
            const chipHidden = CH.cc.chip.className.includes("hidden");
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

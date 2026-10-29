/* Dialogue Handler */

import CO from "./CO.mjs";
import SB from "./SB.mjs"
import CH from "./CH.mjs"


class DH { // Dialogue Handler
    
    static #branch = null;
    static #history = {};
    static #excerpt = null;
    static #replica = null;
    static get ready() {
        return this.#excerpt == null;
    }
    
    static #updateHistory(char, value, relative) {
        const now = relative * (this.#history[char.name] ?? 0) + value;
        this.#history[name] = Math.min(now, this.#branch[char.name].length - 1);
    }
    
    static #readDialogueFor(char) {
        const freeze = ":not(.antifreeze) .btn";
        document.querySelectorAll(freeze).forEach(btn => {
            btn.classList.add("frozen");
        });
        signal.addEventListener("dhDialogueEnd", () => {
            this.#updateHistory(char, 1, true);
            CO.idle();
            document.querySelectorAll(".frozen").forEach(btn => {
                btn.classList.remove("frozen");
            });
        }, { once: 1 });
        this.#excerpt = this.#excerpt ?? 0;
        const dialogues = this.#branch[char.name];
        const now = this.#history[char.name] ?? 0;
        const dialogue = dialogues[now];
        const excerpt = dialogue[this.#excerpt];
        signal.addEventListener("chChosen", e => {
            SB.remove();
            this.#processChoice(e.detail, char);
        }, { once: 1 });
        this.#readExcerpt(excerpt);
    }
    
    static #readExcerpt({ before, replicas, choice }) {
        this.#replica = 0;
        before?.forEach(({ id, pose }) => {
            CO.find(id).pose = pose;
        });
        replicas?.forEach(({ id, text, pose }, i) => {
            signal.addEventListener("dhReplica" + i, () => {
                CO.find(id).say(text, pose, i);
            }, { once: 1 });
        });
        const passLast = 0; //typeof choice === "number" ? choice < 0 : choice == null;
        const end = replicas.length - passLast;
        console.debug("end", {end});
        this.#onReplicaEnd(end, choice);
    }
    
    static #onReplicaEnd(end, choice) {
        console.debug("this.#replica", this.#replica)
        if (SB.active == null) {
            const nextReplica = new Event("dhReplica" + this.#replica++);
            console.debug("nextReplica", nextReplica.type);
            signal.dispatchEvent(nextReplica);
            if (this.#replica >= end) {
                CH.setChoice(choice);
            } else {
                SB.hit();
            }
        } else {
            console.debug("oopsie daisy", SB.active, SB.active.writer.ap);
        }
        body.addEventListener("click", () => {
            this.#onReplicaEnd(end, choice);
        }, { capture: 1, once: 1 });
    }
    
    static #processChoice(chosen, char) {
        alert(JSON.stringify({ chosen }));
        if (chosen?.constructor.name === "Array") {
            return this.#jumpToChosen(chosen);
        } else if (chosen < 0) {
            char.pat();
            this.#excerpt = null;
        } else {
            this.#excerpt = chosen;
        }
        
        setTimeout(() => {
            if (this.#excerpt != null) {
                this.#readDialogueFor(char);
            } else {
                signal.dispatchEvent(new Event("dhDialogueEnd"));
            }
        }, 0.4 * 1000);
    }
    
    static #jumpToChosen(chosen) {
        const [csv, replicas] = chosen;
        this.#excerpt = replicas;
        const [charName, history] = csv.split(":");
        if (charName !== char.name) {
            this.#updateHistory(char.name, 1, true);
            char = CO.find(charName) ?? char;
        }
        if (!Number.isNaN(history)) {
            const value = parseInt(history);
            this.#updateHistory(char, value, false);
        }
        this.#readDialogueFor(char);
    }
    
    static #loadBranch() {
        this.#branch = data.replicas;
        if (data.save.history[data.page] == null) {
            data.save.history[data.page] = {};
        }
        this.#history = data.save.history[data.page];
    }
    
    static #loadChars() {
        document.querySelectorAll(".character").forEach(el => {
            const char = new CO(el);
            el.addEventListener("pointerout", () => {
                if (this.ready) char.idle();
            });
            el.addEventListener("pointerover", () => {
                if (this.ready) char.hover();
            });
            el.addEventListener("click", () => {
                if (this.ready) this.#readDialogueFor(char);
            });
        });
    }
    
    static init() {
        if (this.#branch != null) return;
        this.#loadBranch();
        this.#loadChars();
        
        if (CO.chars.length) {
            root.appendChild(CH.cc.base);
        }
        
        CH.cc.chip.addEventListener("pointerdown", e => {
            const hidden = CH.cc.chip.matches(".hidden");
            if (hidden || SB.active == null) return;
            e.preventDefault();
            const chipStyle = getComputedStyle(CH.cc.chip);
            const x = e.clientX - parseFloat(chipStyle.left);
            const y = e.clientY - parseFloat(chipStyle.top);
            CH.cc.dp = { x, y };
            CH.cc.base.classList.add("active");
            CH.cm.show();
        }, true);
        
        document.body.addEventListener("pointermove", e => CH.dragChip(e));
        document.body.addEventListener("pointerup", e => CH.makeChoice(e));
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => DH.init());
} else DH.init();

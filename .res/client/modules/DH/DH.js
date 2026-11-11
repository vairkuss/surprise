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
        console.log({excerpt: this.#excerpt})
        return this.#excerpt == null && !SB.active.length;
    }
    
    static #updateHistory(char, value, relative) {
        const now = relative * (this.#history[char.name] ?? 0) + value;
        this.#history[char.name] = Math.min(now, this.#branch[char.name].length - 1);
    }

    static #startDialogue(char) {
        this.#excerpt = 0;
        this.#readDialogue(char);
    }
    
    static #readDialogue(char) {
        const freeze = ":not(.antifreeze) .btn";
        document.querySelectorAll(freeze).forEach(btn => {
            btn.classList.add("frozen");
        });
        signal.addEventListener("dhDialogueEnd", () => {
            SB.remove();
            this.#updateHistory(char, 1, true);
            CO.idle();
            document.querySelectorAll(".frozen").forEach(btn => {
                btn.classList.remove("frozen");
            });
        }, { once: 1 });
        const dialogues = this.#branch[char.name];
        const now = this.#history[char.name] ?? 0;
        const dialogue = dialogues[now];
        const excerpt = dialogue[this.#excerpt];
        signal.addEventListener("chChosen", e => {
            SB.remove().then(() => {
                this.#processChoice(e.detail, char);
            });
        }, { once: 1 });
        this.#readExcerpt(excerpt);
    }
    
    static #readExcerpt({ before, replicas, choice }) {
        this.#replica = 0;
        before?.forEach(({ id, pose }) => {
            CO.find(id).pose = pose;
        });
        replicas?.forEach(({ id, text, pose }, i) => {
            signal.addEventListener(`dhReplica${i}`, () => {
                CO.find(id).say(text, pose, i);
            }, { once: 1 });
        });
        this.#onReplicaEnd(replicas.length, choice);
    }
    
    static #onReplicaEnd(end, choice) {
        if (!SB.active.length) {
            SB.hit();
            const nextReplica = new Event("dhReplica" + this.#replica++);
            signal.dispatchEvent(nextReplica);
        }
        if (this.#replica >= end) {
            const { writer } = SB.active.at(-1) ?? {};
            if (writer) {
                writer.onWriteEnd(() => CH.setChoice(choice));
            } else {
                CH.setChoice(choice); /////////////////
            }
        } else {
            body.addEventListener("click", () => {
                this.#onReplicaEnd(end, choice);
            }, { capture: 1, once: 1 });
        }
    }
    
    static #processChoice(chosen, char) {
        if (chosen?.constructor.name === "Array") {
            console.log("dialogue jump")
            this.#jumpToChosen(chosen, char);
        } else if (typeof chosen === "number" && chosen < 0) {
            console.log("patpatted")
            char.pat();
            this.#excerpt = null;
        } else {
            console.log("did nothing, before:",{excerpt: this.#excerpt, chosen})
            this.#excerpt = chosen;
            console.log("after:",{excerpt: this.#excerpt, chosen})
        }

        setTimeout(() => {
            console.log("process choice",{excerpt: this.#excerpt, chosen});
            if (this.#excerpt != null) {
                this.#readDialogue(char);
            } else {
                signal.dispatchEvent(new Event("dhDialogueEnd"));
                console.log("dialogue end");
            }
        }, 0.4 * 1000);
    }
    
    static #jumpToChosen(chosen, char) {
        const [csv, replicas] = chosen;
        this.#excerpt = replicas ?? 0;
        const [charName, history] = csv.split(":");
        if (charName !== char.name) {
            this.#updateHistory(char.name, 1, true);
            char = CO.find(charName) ?? char;
        }
        if (!Number.isNaN(history)) {
            const value = parseInt(history);
            this.#updateHistory(char, value, false);
        }
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
                if (this.ready) this.#startDialogue(char);
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
            if (hidden || SB.active.length) return;
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

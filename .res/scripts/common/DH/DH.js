/* Dialogue Handler */

import { AF } from "AF.js"
import { AH } from "AH.js"
import { SB } from "SB.js"
import { CH } from "CH.js"


class DH { // Dialogue Handler
    
    static #current = {};
    static #cursor = {};
    static #page = null;
    static #clicked = null;
    static get ready() { return this.#page == null }
    static get cursor() { return JSON.parse(JSON.stringify(this.#cursor)) }
    
    static #updateCursor(char, newValue, relative) {
        const bytes = new TextEncoder().encode(JSON.stringify(this.#cursor));
        this.#cursor[char] = (this.#cursor[char] ?? 0) * relative + newValue;
        this.#cursor[char] = Math.min(this.#cursor[char], this.#current[char].length - 1);
        crypto.subtle.digest("SHA-256", bytes).then(hash => {
            const key = new Uint8Array(hash).toHex();
            fetch(`${location.origin}/post/update_cursor?c=${key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.#cursor)
            });
        });
    }
    
    static #readDialogue(char) {
        this.#page = this.#page ?? 0;
        this.#readPage(this.#current[char]?.at(this.#cursor[char])?.at(this.#page));
        
        AF.holdUntill(30, () => this.#clicked === null, () => {
            if (this.#page?.constructor.name === "Array") {
                const [csv, page] = this.#page;
                this.#page = page;
                const [charName, cursor] = csv.split(":");
                if (charName !== char) { this.#updateCursor(char, 1, 1) }
                if (cursor) { this.#updateCursor(charName, parseInt(cursor), 0) }
                return this.#readDialogue(charName);
            } else if (this.#page < 0) {
                const action = [
                    () => AH.patpat(char),
                    () => AH.wagwag(char)
                ].at(~this.#page);
                if (action != null) { action() }
                this.#page = null;
            }
            
            AF.delay(0.4, () => {
                if (this.#page != null) {
                    this.#readDialogue(char);
                } else {
                    this.#updateCursor(char, 1, 1);
                }
            });
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
        
        const skip = typeof choices === "number" ? choices >= 0 : choices != null;
        AF.repeatOnClicksUntill(30,
            () => this.#clicked >= replicas.length - skip && !SB.bubblesActive,
            true,
            () =>  this.#clicked += !SB.bubblesActive,
            () => {
                CH.setChoice(choices);
                AF.holdUntill(30, () => CH.chosen !== undefined && !SB.bubblesActive, () => {
                    SB.bubbles.forEach(sb => sb.remove());
                    this.#page = CH.chosen;
                    this.#clicked = null;
                });
            }
        );
    }
    
    static init(vault) {
        super.init(() => {
            
            fetch(`${location.origin}/get/replicas?p=${window.location.href.split("/").pop()}`)
            .then(async response => [this.current, this.#cursor] = await response.json());
            
            document.querySelectorAll(".character").forEach(el => {
                if (!this.ready) { return }
                fetch(`${location.origin}/get/character_random_sprite?${el.id}=idle`)
                .then(async response => el.src = await response.text());
                
                el.addEventListener("pointerout", async () => {
                    if (!this.ready) { return }
                    el.src = await fetch(`${location.origin}/get/character_random_sprite?${el.id}=idle`)
                    .then(async response => await response.text());
                });
                el.addEventListener("pointerover", async () => {
                    if (!this.ready) { return }
                    el.src = await fetch(`${location.origin}/get/character_random_sprite?${el.id}=hover`)
                    .then(async response => await response.text());
                });
                el.addEventListener("contextmenu", e => {
                    e.preventDefault();
                });
                
                el.addEventListener("click", () => {
                    if (this.ready) { this.#readDialogue(el.id) }
                });
            });
            
            document.body.appendChild(CH.cc.base);
            
            CH.cc.chip.addEventListener("pointerdown", e => {
                const chosen = CH.chosen !== undefined;
                const chipHidden = CH.cc.chip.className.includes("hidden");
                if (chosen && !SB.bubblesActive || chipHidden) { return }
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
        });
    }
}

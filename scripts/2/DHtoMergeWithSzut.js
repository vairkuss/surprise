/* I AF */
/* AH SB CH */
/* Dialogue Handler */

class DH extends I { // Dialogue Handler
    
    static #current = {};
    static #cursor = {};
    static #page = null;
    static #clicked = null;
    static #ready = 1;
    
    static #updateCursor(char, newValue, absolute=1) {
        const bytes = new TextEncoder().encode(JSON.stringify(this.#cursor));
        this.#cursor[char] = (this.#cursor[char] ?? 0) * absolute + (newValue ?? 0);
        this.#cursor[char] = Math.max(0, Math.min(this.#cursor[char], this.#current[char].length - 1));
        
        crypto.subtle.digest("SHA-256", bytes)
        .then(hash => {
            const key = new Uint8Array(hash).toHex();
            fetch(`http://localhost:7148/post/update_cursor?c=${key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.#cursor)
            });
        });
    }
    
    static #readDialogue(char) {
        this.#ready = 0;
        this.#page = this.#page ?? 0;
        this.#readPage(this.#current[char]?.at(this.#cursor[char] ?? 0)?.at(this.#page));
        
        AF.holdUntill(30, () => this.#clicked === null, () => {
            if (this.#page?.constructor.name === "Array") {
                const [csv, page] = this.#page;
                this.#page = page;
                const [charName, cursor] = csv.split(":");
                if (charName !== char) { this.#updateCursor(char, 1) }
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
                    this.#updateCursor(char, 1);
                    this.#ready = 1;
                }
            });
        });
    }
    
    static #readPage({ before, replicas, choice }) {
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
        
        const skip = typeof(choice) === "number" ? choice >= 0 : choice != null;
        AF.repeatOnClicksUntill(30,
            () => this.#clicked >= replicas.length - skip && !SB.bubblesActive,
            true,
            () =>  this.#clicked += !SB.bubblesActive,
            () => {
                CH.setChoice(choice);
                AF.holdUntill(30, () => CH.chosen !== undefined && !SB.bubblesActive, () => {
                    SB.bubbles.forEach(sb => sb.remove());
                    this.#page = CH.chosen;
                    this.#clicked = null;
                });
            }
        );
    }
    
    static init() {
        super.init(() => {
            fetch(`http://localhost:7148/get/replicas?p=${window.location.href.split("/").pop()}`)
            .then(async response => [this.current, this.#cursor] = await response.json());
            
            document.querySelectorAll(".character").forEach(el => {
                if (!this.#ready) { return }
                fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                .then(async response => el.src = await response.text());
                
                el.addEventListener("pointerout", async () => {
                    if (!this.#ready) { return }
                    el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                    .then(async response => await response.text());
                });
                el.addEventListener("pointerover", async () => {
                    if (!this.#ready) { return }
                    el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=hover`)
                    .then(async response => await response.text());
                });
                el.addEventListener("contextmenu", e => {
                    e.preventDefault();
                });
                
                el.addEventListener("click", () => {
                    if (this.#ready) { this.#readDialogue(el.id) }
                });
            });
            
            document.body.appendChild(CH.cc.base);
            CH.cc.chip.addEventListener("pointerdown", e => {
                if (CH.chosen !== undefined && !SB.bubblesActive || CH.cc.chip.className.includes("hidden")) { return }
                e.preventDefault();
                const chipStyle = getComputedStyle(CH.cc.chip);
                const x = parseFloat(chipStyle.left);
                const y = parseFloat(chipStyle.top);
                CH.cc.dp = { x: e.screenX - x, y: e.screenY - y }
                CH.cc.addClass("active");
                CH.cm.show();
            }, true);
            
            document.body.addEventListener("pointermove", e => {
                if (!CH.cc.active) { return }
                e.preventDefault();
                CH.cc.chip.style.left = e.screenX - CH.cc.dp.x + "px";
                CH.cc.chip.style.top = e.screenY - CH.cc.dp.y + "px";
                CH.cc.updateChain();
                const field = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                const id = field != null ? parseInt(field.getAttribute("href").slice(3)) : undefined;
                AF.holdUntill(30, () => CH.cm.wheel.fields != null, () => {
                    const cws = CH.cm.wheel.fields[id];
                    Object.values(CH.cm.wheel.fields).forEach(obj => obj.deactivate());
                    cws?.activate();
                    CH.cm.text.textContent = cws?.text ?? "";
                    CH.cc.setIcon(cws?.icon);
                    document.querySelector(":root").style.setProperty("--cur-color", cws?.color ?? "var(--m-color)");
                });
            });
            
            document.body.addEventListener("pointerup", e => {
                if (!CH.cc.active) { return }
                e.preventDefault();
                CH.cm.hide();
                CH.cc.removeClass("active");
                CH.cc.dp = null;
                const fired = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                if (fired != null) {
                    const id = parseInt(fired.getAttribute("href").slice(3));
                    const cws = CH.cm.wheel.fields[id];
                    CH.chosen = cws.value;
                } else if (CH.chosen !== undefined) {
                    AF.delay(.4, () => {
                        CH.cc.retrieve();
                        CH.cc.setIcon(undefined);
                        CH.chosen = undefined;
                        CH.cm.menu.remove();
                        CH.cc.addClass("hidden");
                        document.querySelector(":root").style.setProperty("--cur-color", "var(--m-color)");
                    });
                } else {
                    CH.cc.retrieve();
                }
            });
        });
    }
}


DH.init();

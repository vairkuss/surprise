/**
class Initable {
    static __initiated = 0;
    static get initiated() { return this.__initiated }
    
    static init(func) {
        if (this.__initiated) { return }
        func();
        this.__initiated = 1;
    }
}
//*/

class CA {
    
    static play(char, animation, pose, pause) {
        // play animation
    }
    
    static blink(char) {
        // transparency blink
    }
    
    static patpat(char) {
        console.info(`you've patted ${char}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // swiping left and right moves image cursor untill pointerup
        // end animation
    }
    
    static wagwag(char) {
        console.info(`${char} showed his back and wagged his tail`);
        // turn character and start animation tailwagging on ::after
        // await pointerdown
        // end animation
    }
}


class DH extends Initable {
    
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
            // fetch(`http://localhost:7148/post/update_cursor?c=${key}`);
            // post updated cursor
        });
    }
    
    static #readDialogue(char) {
        this.#ready = 0;
        this.#page = this.#page ?? 0;
        this.#readPage(this.#current[char]?.at(this.#cursor[char] ?? 0)?.at(this.#page));
        
        AH.holdUntill(30, () => this.#clicked === null, () => {
            if (this.#page?.constructor.name === "Array") {
                const [csv, page] = this.#page;
                this.#page = page;
                const [charName, cursor] = csv.split(":");
                if (charName !== char) { this.#updateCursor(char, 1) }
                if (cursor) { this.#updateCursor(charName, parseInt(cursor), 0) }
                return this.#readDialogue(charName);
            } else if (this.#page < 0) {
                const action = [
                    () => CA.patpat(char),
                    () => CA.wagwag(char)
                ].at(~this.#page);
                if (action != null) { action() }
                this.#page = null;
            }
            
            AH.delay(0.4, () => {
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
        
        /**
        before?.forEach(({ id, pose, animation }) => {
            CA.play(id, animation, pose);
        });
        /**/
        
        replicas?.forEach(async ({ id, text, pose, animation, pause }, i) => {
            AH.holdUntill(30, () => this.#clicked === i, () => {
                const char = document.getElementById(id);
                CA.blink(id);
                // CA.play(id, animation, pose, pause);
                // await animation end, duration is pause ?? .4s
                SB.hit();
                new SB(char, text, pose);
            });
        });
        
        const skip = typeof(choice) === "number" ? choice >= 0 : choice != null;
        AH.repeatOnClicksUntill(30,
            () => this.#clicked >= replicas.length - skip && !SB.bubblesActive,
            true,
            () =>  this.#clicked += !SB.bubblesActive,
            () => {
                CH.setChoice(choice);
                AH.holdUntill(30, () => CH.chosen !== undefined && !SB.bubblesActive, () => {
                    SB.bubbles.forEach(sb => sb.remove());
                    this.#page = CH.chosen;
                    this.#clicked = null;
                });
            }
        );
    }
    
    static init() {
        super.init(() => {
            /**
            fetch(`http://localhost:7148/get/replicas?p=${window.location.href.split("/").pop()}`)
            .then(async response => this.current = await response.json())
            /**
            fetch("http://localhost:7148/get/current_cursor")
            .then(cursor => this.#cursor = JSON.parse(cursor));
            //*/
            this.#current = Dialogue.data["25285:0"];
            
            document.querySelectorAll(".character").forEach(el => {
                if (!this.#ready) { return }
                //fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                //.then(async response => el.src = await response.text());
                el.src = "../res/images/artbook/bad-pet.png"
                
                el.addEventListener("pointerout", async () => {
                    if (!this.#ready) { return }
                    //el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                    //.then(async response => await response.text());
                    el.src = "../res/images/artbook/bad-pet.png"
                });
                el.addEventListener("pointerover", async () => {
                    if (!this.#ready) { return }
                    //el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=hover`)
                    //.then(async response => await response.text());
                    el.src = "../res/images/artbook/good-pet.png"
                });
                el.addEventListener("contextmenu", e => {
                    e.preventDefault();
                });
                
                el.addEventListener("click", () => {
                    if (this.#ready) { this.#readDialogue(el.id) }
                });
            });
            
        });
    }
}


DH.init();
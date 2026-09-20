class Initable {
    static __initiated = 0;
    static get initiated() { return this.__initiated }
    
    static init(func) {
        if (this.__initiated) { return }
        func();
        this.__initiated = 1;
    }
}


class DH extends Initable {
    
    static #cursor = {};
    static #page = null;
    static get active() { return this.#page != null }
    
    static async startDialogue(charId, page=0) {
        this.#page = page;
        const curPage = window.location.href.split("/").pop();
        if (this.#cursor[charId] == null) { this.#cursor[charId] = 0 }
        /**
        fetch(`http://localhost:7148/get/replicas?p=${curPage}&n=${charId}&c=${this.#cursor[charId]}`)
        .then(async response => await response.json())
        .then(current => this.readDialogue(current));
        //*/
        const current = Dialogue.data["25285:0"];
        this.readDialogue(current[charId][this.#cursor[charId]], charId);
    }
    
    static readDialogue(current, char) {
        this.readPage(current[this.#page]);
        AH.holdUntill(30, () => this.clicked === null, () => {
            if (this.#page != null && typeof(this.#page) === "object") {
                const { char: newChar, position } = this.#page;
                if (!!position) { [this.#cursor[char], this.#page] = position };
                return this.startDialogue(newChar ?? char, this.#page);
            } else if (this.#page < 0) {
                const action = [
                    () => this.patpat(char),
                    () => this.wagwag(char)
                ].at(~this.#page);
                if (action) { action() }
                this.#page = null;
            }
            if (this.#page != null) {
                this.readDialogue(current, char);
            } else if (this.#cursor[char] < current.length - 1) {
                /**
                const bytes = new TextEncoder().encode(JSON.stringify(this.#cursor));
                //*/
                this.#cursor[char]++;
                /**
                crypto.subtle.digest("SHA-256", bytes)
                .then(hash => {
                    const hashHex = new Uint8Array(hash).toHex();
                    fetch(`http://localhost:7148/post/update_cursor?c=${hashHex}`);
                    // set method - post
                    // post updated cursor
                });
                //*/
            }
        });
    }
    
    static clicked = null;
    static readPage({ before, replicas, choice}) {
        /**
        before?.forEach(({ id, pose, animation }) => {
            AH.animation(id, animation, pose);
        });
        /**/
        this.clicked = 0;
        replicas?.forEach(async ({ id, text, pose, animation, pause }, i) => {
            AH.holdUntill(30, () => this.clicked === i, () => {
                // start animation or change pose with blink (fast drop of transparency back and forth)
                // AH.animation(id, animation, pose, pause);
                // await animation end, duration is pause ?? .4s
                const char = document.getElementById(id);
                new SB(char, text, pose);
            });
        });
        AH.repeatOnClicksUntill(30,
            () => (this.clicked >= (replicas.length - !!choice)) && !SB.bubblesActive,
            true,
            () => { this.moveNext() },
            () => {
                AH.delay(.4, () => CH.setChoice(choice));
                AH.holdUntill(30, () => CH.chosen !== undefined && !SB.bubblesActive, () => {
                    SB.bubbles.forEach(sb => { sb.remove() });
                    this.#page = CH.chosen;
                    this.clicked = null;
                });
            }
        );
    }
    
    static moveNext() {
        if (SB.bubblesActive) { return }
        SB.hit();
        this.clicked++;
        console.log(this.clicked)
    }
    
    static patpat(charId) {
        console.info(`you've patted ${charId}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // swiping left and right moves image cursor untill pointerup
        // end animation
    }
    
    static wagwag(charId) {
        console.info(`${charId} showed his back and wagged his tail`);
        // turn character and start animation tailwagging on ::after
        // await pointerdown
        // end animation
    }
    
    static init() {
        super.init(() => {
            /**
            fetch("http://localhost:7148/get/current_cursor")
            .then(cursor => this.#cursor = JSON.parse(cursor));
            //*/
            
            document.querySelectorAll(".character").forEach(el => {
                if (this.active) { return }
                //fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                //.then(async response => el.src = await response.text());
                el.src = "../res/images/artbook/bad-pet.png"
                
                el.addEventListener("pointerout", async () => {
                    if (this.active) { return }
                    //el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=idle`)
                    //.then(async response => await response.text());
                    el.src = "../res/images/artbook/bad-pet.png"
                });
                el.addEventListener("pointerover", async () => {
                    if (this.active) { return }
                    //el.src = await fetch(`http://localhost:7148/get/character_random_sprite?${el.id}=hover`)
                    //.then(async response => await response.text());
                    el.src = "../res/images/artbook/good-pet.png"
                });
                el.addEventListener("contextmenu", e => {
                    e.preventDefault();
                });
                
                el.addEventListener("click", () => {
                    if (this.active) { return }
                    this.startDialogue(el.id);
                });
            });
            
        });
    }
}


DH.init();
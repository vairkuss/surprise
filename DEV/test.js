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
    
    static async startDialogue(charId) {
        this.#page = 0;
        //console.log("starting the dialogue for " + charId);
        const curPage = window.location.href.split("/").pop();
        if (this.#cursor[charId] == null) { this.#cursor[charId] = 0 }
        /*
        fetch(`http://localhost:7148/get/replicas?p=${curPage}&n=${charId}&c=${this.#cursor[charId]}`)
        .then(async response => await response.json())
        .then(([current, max]) => this.readDialogue(current, max));
        */
        const current = Dialogue.data["25285:0"];
        this.readDialogue(current[`${charId}:${this.#cursor[charId]}`], charId, current.max[charId]);
    }
    
    static readDialogue(current, char, max) {
        //console.log("reading dialogue");
        this.readPage(current[this.#page]);
        AH.holdUntill(30, () => this.clicked === null, () => {
            if (this.#page < 0) {
                switch (Math.abs(this.#page)) {
                    case 1:
                        this.patpat(char);
                        break;
                    case 2:
                        this.#cursor[char]--;
                        break;
                }
                this.#page = null;
            }
            SB.bubbles.forEach(sb => { sb.remove() });
            if (this.#page != null) {
                this.readDialogue(current, char, max);
            } else if (this.#cursor[char] < max) {
                this.#cursor[char]++;
                // send signal to the server to update its cursor too and save it in json
            }
        });
    }
    
    static clicked = null;
    static readPage({ before, replicas, choice}) {
        //console.log("reading page");
        /*before?.forEach(({ id, pose, animation }) => {
            AH.animation(id, animation ?? pose, pose);
        });*/
        this.clicked = 0;
        replicas?.forEach(async ({ id, text, pose, animation, pause }, i) => {
            AH.holdUntill(30, () => i === this.clicked, () => {
                // start animation or change pose with blink (fast drop of transparency back and forth)
                // await animation end, duration is pause ?? .2s
                const char = document.getElementById(id);
                new SB(char, text, pose);
            });
        });
        AH.repeatOnClicksUntill(30,
            () => this.clicked === replicas.length - 1 && !SB.bubblesActive,
            () => { this.moveNext() },
            () => {
                /**/
                this.#page = this.choice(choice) ?? null;
                this.clicked = null;
                /**
                this.choice(choice)
                AH.holdUntill(1/60, () => CC.chosen !== undefined, () => {
                    this.#page = CC.chosen;
                    this.clicked = null;
                });
                /**/
            }
        );
    }
    
    static moveNext() {
        if (SB.bubblesActive) { return }
        SB.bubbles.forEach(sb => sb.hit());
        this.clicked++;
    }
    
    static choice(choice) {
        if (choice == null) {
            SB.bubbles.forEach(sb => sb.hit());
            return null;
        } else if (typeof(choice) != "object") {
            return choice;
        }
        /**
        return CC.setChoice(choice);
        /**/
        const input = parseInt(prompt(Object.keys(choice).map(v => `${choice[v]}: ${v}`).join("\n")));
        return `${input}` === "NaN" ? null : input;
        //*/
    }
    
    static patpat(charId) {
        console.info(`you've patted ${charId}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // swiping left and right moves image cursor untill pointerup
        // end animation
    }
    
    static init() {
        super.init(() => {
            // get cursor from server
            
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
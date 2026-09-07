class Initable {
    static __initialised = 0;
    static get initiated() { return this.__initialised }
    
    static async init(func) {
        if (this.__initialised) { return }
        func();
        this.__initialised = 1;
    }
}


class SBT {
    constructor(parent, direction) {
        this.direction = [direction[0], direction[1]];
        const bordBias = parseInt(getComputedStyle(parent).borderWidth) * 2;
        const xmlns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(xmlns, "svg");
        svg.setAttribute("xmlns", xmlns);
        svg.setAttribute("width", parent.offsetWidth);
        svg.setAttribute("height", parent.offsetHeight);
        svg.setAttribute("viewBox", `0 0 ${parent.offsetWidth} ${parent.offsetHeight*2}`);
        svg.setAttribute("class", "tail");
        svg.style.top = parent.offsetHeight - bordBias;
        //svg.style.top = getComputedStyle(parent).height - getComputedStyle(parent).minHeight/2;
        parent.appendChild(svg);
        
        const path = document.createElementNS(xmlns, "path");
        svg.appendChild(path);
        
        document.body.addEventListener("resize", ()=> {
            parent.querySelectorAll(".tail").forEach(tail => tail.remove());
            new SBT(parent, direction);
        })
        
        this.char = parent.parentElement.id;
        this.svg = svg;
        this.path = path;
        this.setPath(50);
        //AH.delay(this.setPath.bind(50), 1/60);
    }
    
    setPath(s) {
        let parent = document.querySelector(`#${this.char} > .bubble`);
        console.log(parent);
        const w = parent.offsetWidth;
        const r = parseInt(getComputedStyle(parent).borderRadius) / 2;
        parent = document.querySelector(`#${this.char} > .bubble`);
        console.log(parent);
        const [x, y] = this.direction.map(x => x * s);
        this.path.setAttribute("d", `M${r} 0C${r} 0 ${w/2} 0 ${x + w/2} ${y}C${w/2} 0 ${w - r} 0 ${w - r} 0`);
    }
}


class DH extends Initable {
    
    static #cursor = {};
    static #page = null;
    static get active() {
        return this.#page != null;
    }
    /*
    static async startDialogue(charId) {
        this.#page = 0;
        console.log("starting the dialogue for " + charId);
        const curPage = window.location.href.split("/").pop();
        console.debug("current page: " + curPage);
        if (this.#cursor[charId] == null) { this.#cursor[charId] = 0 }
        console.debug("current cursor state: " + Object.entries(this.#cursor));
        fetch(`http://localhost:7148/get/replicas?p=${curPage}&n=${charId}&c=${this.#cursor[charId]}`)
        .then(async response => await response.json())
        .then(([current, max]) => this.readDialogue(current, max));
    }
    
    static async readDialogue(current, max) {
        while (this.#page != null) {
            this.readPage(current[this.#page]);
            if (this.#page < 0) {
                this.patpat(charId);
                this.#page = null;
            }
        }
        if (this.#cursor[charId] < max) { this.#cursor[charId]++ }
        // post cursor to server save it in progression.json
    }*/
    
    /**/
    static async readPage(id/*{ before, replicas, choice}*/) {
        /*before?.forEach(({ id, pose, animation }) => {
            if (animation != null) { AH.animation(id, animation) }
            if (pose != null) { document.getElementById(id).src = pose; }
        });
        replicas?.forEach(({ id, text, pose, animation, pause }, i, a) => {*/
            // start animation or change pose with blink
            // await animation end, duration is pause ?? 0.2s
            //alert(`${id} (${pose ?? animation}): ${text}`);
            const el = document.getElementById(id);
            
            // change pose to 1.png
            const bubble = this.spawnBubble(el);
            this.writeText(bubble, /**/"привет, я " + el.id);//*/"Моё имя - Артур пирожков. Привет. Ты, наверное, очень рад меня встретить, не так ли?");
            // to 0.png
            //this.proceed(replica)
        //});
        //this.#page = this.choice(choice || null, replicas.length ? replicas[replicas.length - 1] : null);
    }
    
    /*static pause() {
            
        }*/
    
    static spawnBubble(parent) {
        [...parent.querySelectorAll(".bubble"), ...parent.querySelectorAll(".tail")].forEach(bub => bub.remove());
        const bubble = document.createElement("div");
        bubble.className = "hidden bubble block";
        parent.appendChild(bubble);
        AH.delay(() => {
            const randRad = Math.PI / 8 + Math.random() * 5 * Math.PI / 8;
            const direction = [Math.cos(randRad), Math.sin(randRad)]//*0.5 + 0.5]
            bubble.className = "bubble block";
        
            bubble.style.left =`calc(${-direction[0]} * min(30vh, 30vw))`;
            bubble.style.bottom =`calc(${direction[1]} * min(30vh, 30vw))`;
            
            AH.delay(() => {
                new SBT(bubble, direction);
            }, 0.5);
        }, 1/60);
        
        return bubble;
    }
    
    static writeText(bubble, text) {
        bubble.textContent = text;
        // animate text output with correct style, depending on character speaking
        // click speeds up the animation
    }
    /**
    static proceed(replica) {
        // resolve previous bubble
        const bubble = AH.delay(this.spawnBubble, (replica["pause"] || 0), replica);
        bubble.addEventListener("click", () => {
            bubble.className = "hidden button block";
            bubble.remove()
        });
    }
    
    static choice(choice, replica) {
        const bubble = this.spawnBubble(replica);
        if (choice === null || typeof(choice) !== "object") {
            this.proceed(replica);
            //resolve previous bubble
            return choice;
        }
        // add buttons to the div (style and icon depend on value)
        // await button press
        // return button value
        const input = parseInt(prompt(Object.keys(choice).map(v => `${choice[v]}: ${v}`).join("\n")));
        return `${input}` === "NaN" ? null : input;
        //resolve bubble
    }
    
    static patpat(charId) {
        console.info(`you've patted ${charId}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // swiping left and right moves image cursor untill pointerup
        // end animation
    }
    /**/
    // make a class for animation handling
    
    static async init() {
        super.init(() => {
            // get gursor from server
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
                    //this.dialogue(el.id);
                    this.readPage(el.id);
                });
            });
        });
    }
}


DH.init();
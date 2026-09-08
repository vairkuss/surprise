class Initable {
    static __initialised = 0;
    static get initiated() { return this.__initialised }
    
    static async init(init) {
        if (this.__initialised) { return }
        init();
        this.__initialised = 1;
    }
}


class SB {
    static activeBubbles = {};
    
    constructor(parent) {
        this.writing = 0;
        SB.activeBubbles[parent.id]?.remove();
        SB.activeBubbles[parent.id] = this;
        const bubble = document.createElement("div");
        bubble.className = "hidden bubble block";
        parent.appendChild(bubble);
        this.bubble = bubble;
        const face = document.createElement("div");
        bubble.appendChild(face);
        this.face = face;
        const randRad = Math.PI * .25 + Math.random() * Math.PI * .5; // make it prefer the middle area
        this.direction = [Math.cos(randRad), Math.sin(randRad) * .5 + .5];
        AH.delay(1/60, () => {
            bubble.className = "bubble";
        
            bubble.style.left =`calc(${-this.direction[0]} * min(30vh, 30vw))`;
            bubble.style.bottom =`calc(${this.direction[1]} * min(30vh, 30vw))`;
            
            AH.delay(.2, () => {
                this.beginToCollide();
                this.updateTail();
            });
        });
    }
    
    updateTail() {
        this.tail = new SBT(this, 25);
    }
    
    async writeText(text) {
        if (!text.length) { return }
        this.writing = 1;
        let frequency = 20; 
        
        async function addToOutput(sb, cursor=0) {
            if (!"#§¢π∆".includes(text[cursor])) {
                sb.face.textContent += text[cursor];
            }
            sb.updateTail();
            const shortPause = "#!?-.,;)".includes(text[cursor]);
            const longPause = text[cursor] === "§";
            const glitch = text[cursor] === "¢";
            const shake = text[cursor] === "π";
            const jump = text[cursor] === "∆";
            const skip = " \n\t".includes(text[cursor]) || glitch || shake || jump;
            AH.delay(+!skip * (+(shortPause) * 2 + 1) * (+longPause * 4 + 1) / frequency, () => {
                if (cursor >= text.length) { sb.writing = 0; return; }
                const sbStyle = getComputedStyle(sb.bubble);
                sb.bubble.style.marginTop = parseInt(sbStyle.borderRadius) - sb.bubble.offsetHeight + "px";
                addToOutput(sb, cursor);
            });
            cursor++;
        }
        
        AH.delay(1/60, () => {
            document.body.addEventListener("click", () => { frequency *= 20 }, { once: 1 });
        });
        
        await AH.delay(0.3, () => {
            addToOutput(this);
        });
    }
    
    async beginToCollide() {
        this.v = { x: 0, y: 0 };
        this.a = { x: 0, y: 0 };
        
        this.colisionInterval = setInterval(() => {
            const curRect = this.bubble.getBoundingClientRect();
            const curStyle = getComputedStyle(this.bubble);
            const directionX = curRect.left < document.body.offsetWidth * .02 ? 1
                : curRect.right > document.body.offsetWidth * .98 ? -1
                : 0
            this.v.x += directionX ||  -4 * this.v.x / Math.abs(this.v.x || 1);
            if (Math.abs(this.v.x) < 1) { this.v.x = 0 }
            this.bubble.style.left = parseInt(curStyle.left) + this.v.x + "px";
            
            const mrg = parseInt(curStyle.borderRadius) * 1.2;
            this.bubble.style.marginBottom = `calc(${-Object.values(SB.activeBubbles)
            .filter(sb => sb.bubble.getBoundingClientRect().bottom < curRect.bottom)
            .reduce((mrgT, sb) => mrgT + sb.bubble.offsetHeight + mrg, -mrg) / 10} * var(--bub-size))`;
        }, 1000/30);
    }
    
    remove() {
        this.bubble.remove();
        clearInterval(this.colisionInterval);
    }
}


class SBT {
    constructor(sb, length) {
        sb.tail?.svg.remove();
        const xmlns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(xmlns, "svg");
        this.svg.setAttribute("xmlns", xmlns);
        this.svg.setAttribute("width", sb.bubble.offsetWidth);
        this.svg.setAttribute("height", sb.bubble.offsetHeight);
        this.svg.setAttribute("viewBox", `0 0 ${sb.bubble.offsetWidth} ${sb.bubble.offsetHeight}`);
        this.svg.setAttribute("class", "tail");
        const bordBias = parseInt(getComputedStyle(sb.bubble).borderWidth) * 2;
        this.svg.style.top = sb.bubble.offsetHeight - bordBias - 0.5;
        this.svg.style.left = -bordBias / 2; // why? - idk, but it works
        sb.bubble.appendChild(this.svg);
        
        const path = document.createElementNS(xmlns, "path");
        const w = sb.bubble.offsetWidth;
        const r = parseInt(getComputedStyle(sb.bubble).borderRadius) / 2;
        const [x, y] = sb.direction.map(x => x * length);
        path.setAttribute("d", `M${w*.25} 0C${w*.25} 0 ${w*.5} 0 ${x + w*.5} ${y}C${w*.5} 0 ${w*.75} 0 ${w*.75} 0`);
        this.svg.appendChild(path);
        
        /*document.body.addEventListener("resize", ()=> {
            parent.querySelectorAll(".tail").forEach(tail => tail.remove());
            new SBT(parent, direction);
        })*/
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
            // await animation end, duration is pause ?? .2s
            //alert(`${id} (${pose ?? animation}): ${text}`);
            if (Object.values(SB.activeBubbles).filter(sb => sb.writing).length) { return }
            const el = document.getElementById(id);
            
            // change pose to 1.png
            const bubble = new SB(el);
            await bubble.writeText("Погоди-ка.§§.§§.§§§§\nЧто-то тут# не# так...§§§\nЭто§ ты§ скушал§ сосиску§§§§ Дениса Армянова?§§...");
            // to .png
            //this.proceed(replica)
        //});
        //this.#page = this.choice(choice || null, replicas.length ? replicas[replicas.length - 1] : null);
    }
    
    /*static pause() {
            
        }*/
    
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
                    //this.dialogue(el.id);
                    this.readPage(el.id);
                });
            });
        });
    }
}


DH.init();
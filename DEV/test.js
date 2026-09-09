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
            });
        });
    }
    
    updateTail() {
        this.tail = new SBT(this);
    }
    
    async writeText(text) {
        if (!text?.length) { return }
        this.writing = 1;
        let frequency = 20; 
        
        async function addToOutput(sb, cursor=0) {
            if (!"#§¢π∆".includes(text[cursor])) {
                sb.face.textContent += text[cursor];
            }
            const shortPause = "#!?-.,;)".includes(text[cursor]);
            const longPause = text[cursor] === "§";
            const glitch = text[cursor] === "¢";
            const shake = text[cursor] === "π";
            const jump = text[cursor] === "∆";
            const skip = " \n\t".includes(text[cursor]) || glitch || shake || jump;
            AH.delay(+!skip * (+(shortPause) * 2 + 1) * (+longPause * 4 + 1) / frequency, () => {
                if (cursor >= text.length) { sb.writing = 0; return; }
                const sbStyle = getComputedStyle(sb.bubble);
                sb.bubbleStyleMarginTop = parseInt(sbStyle.borderRadius) - sb.bubble.offsetHeight;
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
        this.colisionInterval = setInterval(() => {
            const curRect = this.bubble.getBoundingClientRect();
            const curStyle = getComputedStyle(this.bubble);
            const directionX = curRect.left < document.body.offsetWidth * .02 ? 1
                : curRect.right > document.body.offsetWidth * .98 ? -1
                : 0
            this.v.x += directionX || -Math.sign(this.v.x);
            //this.v.x = Math.trunc(this.v.x + (directionX ||  -4 * this.v.x / Math.abs(this.v.x || 1)));
            this.bubble.style.left = parseInt(curStyle.left) + this.v.x + "px";
            
            const mrg = parseInt(curStyle.borderRadius);
            this.bubble.style.marginTop = -Object.values(SB.activeBubbles)
            .filter(sb => sb.bubble.getBoundingClientRect().top < curRect.top)
            .reduce((mrgT, sb) => {
                const sbRect = sb.bubble.getBoundingClientRect();
                const sbHeight = sbRect.bottom - sbRect.top;
                return mrgT - sbHeight - mrg;
            }, mrg) + this.bubbleStyleMarginTop + "px";
            
            this.updateTail();
        }, 1000/30);
    }
    
    remove() {
        clearInterval(this.colisionInterval);
        const curRect = this.bubble.getBoundingClientRect();
        const curStyle = getComputedStyle (this.bubble);
        const parentRect = this.bubble.parentElement.getBoundingClientRect();
        this.bubble.style.position = "fixed";
        this.bubble.style.top = parseInt(curStyle.top) + curRect.top + "px";
        this.bubble.style.left = parseInt(curStyle.left) + curRect.left + "px";
        this.bubble.style.marginTop = "";
        this.bubble.className = "hidden bubble block";
        this.tail?.svg.remove();
        AH.delay(0.4, () => { this.bubble.remove() });
    }
}


class SBT {
    constructor(sb) {
        sb.tail?.svg.remove();
        const xmlns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(xmlns, "svg");
        this.svg.setAttribute("xmlns", xmlns);
        this.svg.setAttribute("width", sb.bubble.offsetWidth);
        this.svg.setAttribute("height", sb.bubble.offsetHeight * 3);
        this.svg.setAttribute("viewBox", `0 0 ${sb.bubble.offsetWidth} ${sb.bubble.offsetHeight * 3}`);
        this.svg.setAttribute("class", "tail");
        const bordBias = parseInt(getComputedStyle(sb.bubble).borderWidth) * 2;
        this.svg.style.top = sb.bubble.offsetHeight - bordBias - 0.5;
        this.svg.style.left = -bordBias / 2;
        sb.bubble.appendChild(this.svg);
        
        const path = document.createElementNS(xmlns, "path");
        
        const svgRect = this.svg.getBoundingClientRect();
        const svgMidX = svgRect.left + (svgRect.right - svgRect.left) / 2;
        
        const sbStyle = getComputedStyle(sb.bubble);
        const r = parseInt(sbStyle.borderRadius);
        const w = sb.bubble.offsetWidth;
        
        const char = sb.bubble.parentElement;
        if (char == null) { return }
        const charRect = char.getBoundingClientRect();
        const charMidX = charRect.left + char.offsetWidth / 2;
        const charMidY = charRect.top + char.offsetHeight / 2;
        const charSide = Math.sign(charMidX - document.body.offsetWidth / 2);
        
        const a = charMidX - svgMidX;
        const b = charMidY - svgRect.bottom - parseInt(sbStyle.marginTop);
        const c = Math.sqrt(a**2 + b**2);
        
        const rad = Math.atan2(b, a);
        const direction = [-Math.cos(rad), Math.sin(rad)];
        //////console.debug(`  c,  b,svy,dbsmt\n${[c, b, svgRect.bottom].map(v => Math.trunc(v))},${sbStyle.marginTop}`);
        const [x, y] = direction.map(v => c - v * r);
        
        //console.debug(`мид: ${[charMidX, charMidY]}\nсвг: ${svgRectMidX}\nбок: ${charSide}\nабс: ${[a, b, c]}\nрад: ${rad}\nдир: ${direction}\nху: ${[x, y]}`);
        path.setAttribute("d", `M${w*.25} 0C${w*.25} 0 ${w*.5} 0 ${x} ${y}C${w*.5} 0 ${w*.75} 0 ${w*.75} 0`);
        this.svg.appendChild(path);
        
        // add window resize handling document.body.addEventListener("resize" () => { ... });
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
        /*
        fetch(`http://localhost:7148/get/replicas?p=${curPage}&n=${charId}&c=${this.#cursor[charId]}`)
        .then(async response => await response.json())
        .then(([current, max]) => this.readDialogue(current, max));
        *//*
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
            await bubble.writeText()//"Погоди-ка.§§.§§.§§§§\nЧто-то тут# не# так...§§§\nЭто§ ты§ скушал§ сосиску§§§§ Дениса Армянова?§§...");//text);
            // to 0.png
            //this.proceed(replica)
        //});
        //this.#page = this.choice(choice || null, replicas.length ? replicas[replicas.length - 1] : null);
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
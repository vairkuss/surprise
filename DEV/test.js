class Initable {
    static __initiated = 0;
    static get initiated() { return this.__initiated }
    
    static init(func) {
        if (this.__initiated) { return }
        func();
        this.__initiated = 1;
    }
}


class SB {
    static activeBubbles = {};
    
    constructor(parent) {
        SB.activeBubbles[parent.id]?.remove();
        SB.activeBubbles[parent.id] = this;
        
        this.writing = 0;
        this.lifes = 2;
        
        this.bubble = document.createElement("div");
        this.bubble.className = "hidden bubble";
        parent.appendChild(this.bubble);
        
        this.face = document.createElement("div");
        this.bubble.appendChild(this.face);
        
        // fly out
        const randRad = Math.PI * .25 + Math.random() * Math.PI * .5;
        const direction = [Math.cos(randRad), Math.sin(randRad) * .5 + .5];
        AH.delay(1/60, () => {
            this.bubble.className = "bubble";
            this.bubble.style.left = `calc(${-direction[0]} * min(30vh, 30vw))`;
            this.bubble.style.bottom = `calc(${direction[1]} * min(30vh, 30vw))`;
        });
        
        // begin to collide
        this.v = { x: 0, y: 0 };
        this.colisionInterval = setInterval(() => {
            const curRect = this.bubble.getBoundingClientRect();
            const curStyle = getComputedStyle(this.bubble);
            const directionX = (
                curRect.left < document.body.offsetWidth * .02 ? 1
                : curRect.right > document.body.offsetWidth * .98 ? -1
                : 0
            );
            this.v.x += directionX || -Math.sign(this.v.x);
            this.bubble.style.left = parseInt(curStyle.left) + this.v.x + "px";
            
            const mrg = parseInt(curStyle.borderRadius);
            this.bubble.style.marginTop = -Object.values(SB.activeBubbles)
            .filter(sb => sb.bubble.getBoundingClientRect().top < curRect.top)
            .reduce((mrgT, sb) => {
                const sbRect = sb.bubble.getBoundingClientRect();
                return mrgT - sbRect.height - mrg;
            }, mrg) + this.mrgComp + "px";
            this.updateTail();
        }, 1000/30);
    }
    
    updateTail() {
        this.tail = new SBT(this);
    }
    
    async writeText(text) {
        if (!text?.length) { return }
        this.writing = 1;
        let frequency = 20; 
        AH.delay(1/60, () => {
            document.body.addEventListener("click", () => { frequency *= 20 }, { once: 1 });
        });
        
        async function addToOutput(c=0) {
            if (!"•§¢π∆".includes(text[c])) {
                this.face.textContent += text[c];
            }
            const shortPause = "•!?-.,;)".includes(text[c]);
            const longPause = text[c] === "§";
            const glitch = text[c] === "¢";
            const shake = text[c] === "π";
            const jump = text[c] === "∆";
            const skip = " \n\t".includes(text[c]) || glitch || shake || jump;
            c++;
            AH.delay(+!skip * (+shortPause * 2 + 1) * (+longPause * 4 + 1) / frequency, () => {
                if (c >= text.length) { this.writing = 0; return; }
                const style = getComputedStyle(this.bubble);
                const rect = this.bubble.getBoundingClientRect();
                this.mrgComp = parseInt(style.borderRadius) - rect.height;
                addToOutput.call(this, c);
            });
        }
        
        addToOutput.call(this);
    }
    
    remove() {
        clearInterval(this.colisionInterval);
        delete SB.activeBubbles[this.bubble.parentElement.id];
        const rect = this.bubble.getBoundingClientRect();
        const style = getComputedStyle(this.bubble);
        this.bubble.style.top = rect.top - rect.height - parseInt(style.borderWidth) + "px";
        this.bubble.style.left = rect.left + "px";
        this.bubble.style.marginTop = "";
        this.bubble.style.position = "fixed";
        this.bubble.className = "hidden bubble";
        AH.delay(.4, () => { this.bubble.remove() });
    }
}


class SBT {
    constructor(sb) {
        sb.tail?.svg.remove();
        
        const charRect = sb.bubble.parentElement.getBoundingClientRect();
        const charMidX = charRect.left + charRect.width / 2;
        const charMidY = charRect.top + charRect.height / 2;
        
        const sbStyle = getComputedStyle(sb.bubble);
        const bordBias = parseInt(sbStyle.borderWidth);
        const r = parseInt(sbStyle.borderRadius);
        
        const sbRect = sb.bubble.getBoundingClientRect();
        const w = sbRect.width;
        const sbMidX = sbRect.left + w / 2;
        
        const a = charMidX - sbMidX;
        const b = Math.max(charMidY - sbRect.bottom, 0);
        const c = Math.sqrt(a**2 + b**2);
        
        const xmlns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(xmlns, "svg");
        this.svg.setAttribute("xmlns", xmlns);
        this.svg.setAttribute("width", w);
        this.svg.setAttribute("height", b);
        this.svg.setAttribute("viewBox", `0 0 ${w} ${b}`);
        this.svg.setAttribute("class", "tail");
        this.svg.style.top = sbRect.height - bordBias * 2 - 1; // idk why -1, it just works
        this.svg.style.left = -bordBias;
        sb.bubble.appendChild(this.svg);
        
        const rad = Math.atan2(b, a);
        const direction = [Math.cos(rad), Math.sin(rad)];
        const [x, y] = direction.map(v => v * (c - r * 1.5));
        
        const path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", `M${(w-r)/2} 0C${(w-r)/2} 0 ${w*.5} 0 ${x+w*.5} ${y}C${w*.5} 0 ${(w+r)/2} 0 ${(w+r)/2} 0`);
        this.svg.appendChild(path);
    }
}


class DH extends Initable {
    
    static #cursor = {};
    static #page = null;
    static get active() { return this.#page != null }
    
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
        */
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
    }
    
    static async readPage(id/*{ before, replicas, choice}*/) {
        /*before?.forEach(({ id, pose, animation }) => {
            if (animation != null) { AH.animation(id, animation) }
            if (pose != null) { document.getElementById(id).src = pose; }
        });
        replicas?.forEach(({ id, text, pose, animation, pause }, i, a) => {*/
            // start animation or change pose with blink
            // await animation end, duration is pause ?? .2s
            //alert(`${id} (${pose ?? animation}): ${text}`);
            if (Object.values(SB.activeBubbles).some(sb => sb.writing)) { return }
            const el = document.getElementById(id);
            
            // change pose to 1.png
            const bubble = new SB(el);
            await bubble.writeText(/*);//*/"Погоди-ка.§§.§§.§§§§\nЧто-то тут# не# так...§§§\nЭто§ ты§ скушал§ сосиску§§§§ Дениса Армянова?§§...");//text);
            // to 0.png
            //this.proceed(replica)
        //});
        //this.#page = this.choice(choice || null, replicas.length ? replicas[replicas.length - 1] : null);
    }
    
    
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
                    //this.dialogue(el.id);
                    this.readPage(el.id);
                });
            });
            
            document.body.addEventListener("click", () => {
                if (Object.values(SB.activeBubbles).some(sb => sb.writing)) { return }
                Object.values(SB.activeBubbles).forEach(sb => {
                    sb.lifes--;
                    if (!sb.lifes) { sb.remove() }
                });
            }, true);
            
        });
    }
}


DH.init();
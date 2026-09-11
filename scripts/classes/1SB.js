class SB {
    static pairs = {};
    static get bubbles() {
        return Object.values(this.pairs);
    }
    static get activeBubbles() {
        return this.bubbles.some(sb => sb.writing);
    }
    static get chars() {
        return Object.keys(this.pairs);
    }
    
    constructor(parent, text="...") {
        SB.pairs[parent.id]?.remove();
        SB.pairs[parent.id] = this;
        
        this.writing = 0;
        this.lifes = 2;
        
        this.bubble = document.createElement("div");
        this.bubble.className = "hidden bubble";
        parent.appendChild(this.bubble);
        
        this.face = document.createElement("div");
        this.face.className = "face";
        this.bubble.appendChild(this.face);
        
        this.#flyOut();
        this.#startDrawing();
        this.#startColliding();
        this.#writeText(text);
    }
    
    #flyOut () {
        const randRad = Math.PI * .25 + Math.random() * Math.PI * .5;
        const direction = [Math.cos(randRad), Math.sin(randRad) * .5 + .5];
        AH.delay(1/60, () => {
            this.bubble.className = "bubble";
            this.bubble.style.left = `calc(${-direction[0]} * min(30vh, 30vw))`;
            this.bubble.style.bottom = `calc(${direction[1]} * min(30vh, 30vw))`;
        });
    }
    
    #startDrawing() {
        this.drawInterval = setInterval(() => {
            const rect = this.face.getBoundingClientRect();
            const style = getComputedStyle(this.face);
            this.tail = new SBT(this);
            this.bubble.parentElement.style.zIndex = this.lifes + 90;
            this.mrgComp = parseInt(style.borderRadius) - rect.height;
        }, 1000/30);
    }
    
     #startColliding() {
        this.v = { x: 0, y: 0 };
        AH.delay(0.4, () => {
            this.collisionInterval = setInterval(() => {
                const curRect = this.bubble.getBoundingClientRect();
                const curStyle = getComputedStyle(this.bubble);
                const directionX =
                    curRect.left < document.body.offsetWidth * .02 ? 1
                    : curRect.right > document.body.offsetWidth * .98 ? -1
                    : 0
                this.v.x += directionX || -Math.sign(this.v.x);
                this.bubble.style.left = parseInt(curStyle.left) + this.v.x + "px";
            
                const mrg = parseInt(getComputedStyle(this.face).borderRadius);
                this.bubble.style.marginTop = Object.values(SB.pairs)
                .filter(sb => sb.bubble.getBoundingClientRect().top > curRect.top)
                .reduce((mrgT, sb) => {
                    return mrgT - sb.face.getBoundingClientRect().height - mrg;
                }, mrg) + this.mrgComp + "px";
            }, 1000/30);
        });
    }
    
    #writeText(text) {
        if (!text?.length) { return }
        this.face.textContent = "";
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
                const style = getComputedStyle(this.face);
                const rect = this.face.getBoundingClientRect();
                addToOutput.call(this, c);
            });
        }
        addToOutput.call(this);
    }
    
    hit() {
        this.lifes--;
        if (!this.lifes) { this.remove() }
    }
    
    remove() {
        clearInterval(this.collisionInterval);
        clearInterval(this.drawInterval);
        delete SB.pairs[this.bubble.parentElement.id];
        const rect = this.face.getBoundingClientRect();
        const style = getComputedStyle(this.bubble);
        this.bubble.style.top = rect.top + "px";
        this.bubble.style.left = rect.left + "px";
        this.bubble.style.marginTop = "";
        this.bubble.style.transition = ""
        AH.delay(1/60, () => {
            this.bubble.style.top = rect.top - rect.height + "px";
            this.bubble.style.transition = "all 0.3s ease-out"
            this.bubble.style.position = "fixed";
        });
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
        
        const r = parseInt(getComputedStyle(sb.face).borderRadius);
        
        const faceRect = sb.face.getBoundingClientRect();
        const w = faceRect.width;
        const faceMidX = faceRect.left + w / 2;
        
        const a = charMidX - faceMidX;
        const b = Math.max(charMidY - faceRect.bottom, 0);
        const c = Math.sqrt(a**2 + b**2);
        
        const xmlns = "http://www.w3.org/2000/svg";
        this.svg = document.createElementNS(xmlns, "svg");
        this.svg.setAttribute("xmlns", xmlns);
        this.svg.setAttribute("width", w);
        this.svg.setAttribute("height", b);
        this.svg.setAttribute("viewBox", `0 0 ${w} ${b}`);
        this.svg.setAttribute("class", "tail");
        sb.bubble.appendChild(this.svg);
        
        const rad = Math.atan2(b, a);
        const direction = [Math.cos(rad), Math.sin(rad)];
        const [x, y] = direction.map(v => v * (c - r * 2));
        
        const path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", `M${(w-r)/2} 0C${(w-r)/2} 0 ${w*.5} 0 ${x+w*.5} ${y+r}C${w*.5} 0 ${(w+r)/2} 0 ${(w+r)/2} 0`);
        this.svg.appendChild(path);
    }
}
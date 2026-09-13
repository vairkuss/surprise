class SB {
    static pairs = {};
    static get bubbles() {
        return Object.values(this.pairs);
    }
    static get bubblesActive() {
        return this.bubbles.some(sb => sb.writing);
    }
    static get chars() {
        return Object.keys(this.pairs);
    }
    
    constructor(parent, text) {
        SB.pairs[parent.id]?.remove();
        SB.pairs[parent.id] = this;
        
        this.writing = 0;
        if (text == null) { return this }
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
            this.mrgComp = parseFloat(style.borderRadius) - rect.height;
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
                this.bubble.style.left = parseFloat(curStyle.left) + this.v.x + "px";
            
                const mrg = parseFloat(getComputedStyle(this.face).borderRadius) / 2;
                this.bubble.style.marginTop = Object.values(SB.pairs)
                .filter(sb => sb.bubble.getBoundingClientRect().top > curRect.top)
                .reduce((mrgT, sb) => {
                    const faceRect = sb.face.getBoundingClientRect();
                    return mrgT - faceRect.height - mrg;
                }, -mrg) - this.mrgComp + "px";
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
            if (!"×•§¢π∆".includes(text[c])) {
                this.face.textContent += text[c];
            }
            const shortPause = "•!?-.,;)".includes(text[c]);
            const longPause = text[c] === "§";
            const glitch = text[c] === "¢";
            const shake = text[c] === "π";
            const jump = text[c] === "∆";
            const skip = " \n\t".includes(text[c])
                || c && text.length > 1 && text[c-1] === "×"
                || glitch || shake || jump;
            c++;
            AH.delay(+!skip * (+shortPause * 2 + 1) * (+longPause * 4 + 1) / frequency, () => {
                if (c >= text.length) {
                    this.writing = 0;
                    return;
                }
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
        const faceRect = this.face.getBoundingClientRect();
        const style = getComputedStyle(this.bubble);
        const tailRect = this.tail.svg.getBoundingClientRect();
        const charRect = this.bubble.parentElement.getBoundingClientRect();
        this.bubble.style.top = -(charRect.bottom - charRect.height / 2 - faceRect.bottom);
        this.bubble.style.position = "absolute";
        this.tail.svg.style.transition = this.bubble.style.transition;
        this.tail.svg.style.marginTop = 0;
        this.tail.svg.style.height = 0;
        setTimeout(() => {
            this.bubble.className = "hidden bubble";
        }, 1000/60);
        setTimeout(() => {
            this.bubble.remove();
        }, 400);
    }
}


class SBT {
    constructor(sb) {
        sb.tail?.svg.remove();
        document.body.querySelectorAll("#todelete").forEach(e => e.remove());
        
        const charRect = sb.bubble.parentElement.getBoundingClientRect();
        const charMidX = charRect.left + charRect.width / 2;
        const charMidY = charRect.top + charRect.height / 2;
        
        const faceStyle = getComputedStyle(sb.face);
        const r = parseFloat(faceStyle.borderRadius) * 1.5;
        const mrgComp = parseFloat(faceStyle.marginTop);
        
        const faceRect = sb.face.getBoundingClientRect();
        const w = faceRect.width;
        const faceMidX = faceRect.left + w / 2;
        
        const a = charMidX - faceMidX;
        const b = Math.max(charMidY - faceRect.bottom + faceRect.height, 0);
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
        const [x, y] = direction.map(v => v * (c - r));
        
        const path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", `M${(w-r)/2} 0C${(w-r)/2} 0 ${w*.5} 0 ${x+w*.5} ${y}C${w*.5} 0 ${(w+r)/2} 0 ${(w+r)/2} 0`);
        this.svg.appendChild(path);
        
        /**
        const createPoint = (x, y) => {
            const p = document.createElement("i");
            p.style = `position: fixed; z-index: 1000; top: ${y-2.5}px; left: ${x-2.5}px; background: orange; width: 5px; height: 5px; border-radius: 5px`;
            p.id = "todelete";
            document.body.appendChild(p);
        }
        const createLine = (x1, y1, x2, y2) => {
            const w = Math.abs(x1 - x2);
            const h = Math.abs(y1 - y2);
            const bx = Math.min(x1, x2);
            const by = Math.min(y1, y2);
            const svg = document.createElementNS(xmlns, "svg");
            svg.setAttribute("xmlns", xmlns);
            svg.setAttribute("width", w);
            svg.setAttribute("height", h);
            svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
            svg.setAttribute("id", "todelete");
            svg.setAttribute("style", `position: fixed; z-index: 1000; stroke-width: 2px; stroke: red; top: ${by}; left: ${bx}`);
            document.body.appendChild(svg);
            const p = document.createElementNS(xmlns, "path");
            p.setAttribute("d", `M${x1-bx} ${y1-by}L${x2-bx} ${y2-by}`);
            svg.appendChild(p);
        }
        const createCircle = (x, y, r) => {
            const svg = document.createElementNS(xmlns, "svg");
            svg.setAttribute("xmlns", xmlns);
            svg.setAttribute("width", r*2);
            svg.setAttribute("height", r*2);
            svg.setAttribute("viewBox", `0 0 ${r*2} ${r*2}`);
            svg.setAttribute("id", "todelete");
            svg.setAttribute("style", `position: fixed; z-index: 1000; stroke-width: 2px; stroke: turquoise; fill: transparent; top: ${y-r}; left: ${x-r}`);
            document.body.appendChild(svg);
            const c = document.createElementNS(xmlns, "circle");
            c.setAttribute("r", r);
            c.setAttribute("cx", r);
            c.setAttribute("cy", r);
            svg.appendChild(c);
        }
        createPoint(faceMidX, faceRect.bottom - faceRect.height);
        createPoint(charMidX, charMidY);
        createLine(faceMidX, faceRect.bottom - faceRect.height, charMidX, charMidY);
        createCircle(charMidX, charMidY, r);
        createPoint(faceMidX + x, faceRect.bottom + y - faceRect.height);
        //*/
    }
}
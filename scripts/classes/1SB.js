class SB {
    static pairs = {};
    static get chars() {
        return Object.keys(this.pairs);
    }
    static get bubbles() {
        return Object.values(this.pairs);
    }
    static get bubblesActive() {
        return this.bubbles.some(sb => sb.writing);
    }
    
    constructor(char, text, pose) {
        SB.pairs[char.id]?.remove();
        SB.pairs[char.id] = this;
        
        this.writing = 0;
        if (text == null) { return this }
        this.lifes = [...document.body.querySelectorAll(".character")].length;
        
        this.bubble = document.createElement("div");
        this.bubble.className = "hidden bubble";
        char.appendChild(this.bubble);
        
        this.face = document.createElement("div");
        this.face.className = "face";
        this.bubble.appendChild(this.face);
        
        this.#flyOut();
        this.#startDrawing();
        this.#startColliding();
        this.#writeText(char, text, pose);
    }
    
    #flyOut () {
        const randRad = Math.PI * .25 + Math.random() * Math.PI * .5;
        const direction = [Math.cos(randRad), Math.sin(randRad) * .5 + .5];
        AH.delay(1/60, () => {
            this.bubble.className = "bubble";
            this.bubble.style.left = `calc(${direction[0]} * min(30vh, 30vw))`;
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
        this.vx = 0;
        const charRect = this.bubble.parentElement.getBoundingClientRect();
        const charMidY = charRect.top + charRect.height/2;
        AH.delay(0.4, () => {
            const faceRect = this.face.getBoundingClientRect();
            this.y = faceRect.top - charMidY;
            this.collisionInterval = setInterval(() => {
                const curRect = this.bubble.getBoundingClientRect();
                const curStyle = getComputedStyle(this.bubble);
                const directionX =
                    curRect.left < document.body.offsetWidth * .02 ? 1
                    : curRect.right > document.body.offsetWidth * .98 ? -1
                    : 0
                this.vx += directionX || -Math.sign(this.vx);
                this.bubble.style.left = parseFloat(curStyle.left) + this.vx + "px";
            
                const mrg = parseFloat(getComputedStyle(this.face).borderRadius);
                this.bubble.style.top = SB.bubbles
                .filter(sb => sb.bubble.getBoundingClientRect().top > curRect.top)
                .reduce((mrgT, sb) => {
                    const sbHeight = sb.face.getBoundingClientRect().height;
                    return mrgT - sbHeight - mrg;
                }, this.y) + faceRect.height + this.mrgComp + "px";
            }, 1000/30);
        });
    }
    
    #writeText(char, text, pose) {
        if (!text?.length) { return }
        this.face.textContent = "";
        this.writing = 1;
        let frequency = 20; 
        AH.delay(1/60, () => {
            document.body.addEventListener("click", () => { frequency *= 20 }, { once: 1 });
        });
        
        async function addToOutput(c=0) {
            if (
                c && text[c-1] === "\\"
                || !"\\•§¢π∆×√|®".includes(text[c])
            ) { this.face.textContent += text[c] }
            
            if (text[c] === "®") {
                this.remove();
                return;
            }
            
            const shortPause = "•!?-.,);3".includes(text[c]);
            const longPause = text[c] === "§";
            const glitch = text[c] === "¢";
            const shake = text[c] === "π";
            const jump = text[c] === "∆";
            const skip = ": \n\t".includes(text[c])
                || glitch
                || shake
                || jump
                || c && text[c-1] === "×"
                || ": \n\t|".split("").reduce((last, sep) => {
                    return last.split(sep).at(-1);
                }, this.face.textContent).startsWith("√");
            
            if (longPause) {
                char.src = `res/images/characters/${char.id}/${pose}0.png`;
            }
            if (glitch) {
                this.bubble.className = this.bubble.className.startsWith("glitch")
                    ? this.bubble.className.split(" ").filter(cn => cn !== "glitch").join(" ")
                    : "glitch " + this.bubble.className;
                this.bubble.parentElement.className = this.bubble.className.startsWith("glitch")
                    ? this.bubble.parentElement.className.split(" ").filter(cn => cn !== "glitch").join(" ")
                    : "glitch " + this.bubble.parentElement.className;
            }
            if (shake) {
                this.bubble.className = this.bubble.className.startsWith("shake")
                    ? this.bubble.className.split(" ").filter(cn => cn !== "shake").join(" ")
                    : "shake " + this.bubble.className;
            }
            if (jump) {
                const h = parseFloat(getComputedStyle(this.face).borderRadius);
                const cur = parseFloat(getComputedStyle(this.bubble).marginTop);
                this.bubble.style.marginTop = cur - h + "px";
            }
            
            c++;
            AH.delay(+!skip * (+shortPause * 2 + 1) * (+longPause * 9 + 1) / frequency, () => {
                if (c >= text.length) {
                    this.className = "bubble";
                    this.writing = 0;
                    return;
                }
                if (c < text.length - 1 && text[c+1] !== "§") {
                    char.src = `res/images/characters/${char.id}/${pose}1.png`
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
        const tailRect = this.tail.svg.getBoundingClientRect();
        const charRect = this.bubble.parentElement.getBoundingClientRect();
        this.bubble.style.top = -(charRect.bottom - charRect.height / 2 - faceRect.bottom);
        this.bubble.style.position = "absolute";
        this.tail.svg.style.transition = this.bubble.style.transition;
        this.tail.svg.style.marginTop = 0;
        this.tail.svg.style.height = 0;
        AH.delay(1/60, () => {
            this.bubble.className = "hidden bubble";
        });
        AH.delay(.4, () => {
            this.bubble.remove();
        });
    }
}


class SBT {
    constructor(sb) {
        sb.tail?.svg.remove();
        //if (!SB.bubbles.filter(sbb => sbb.lifes === 1)) {
            document.body.querySelectorAll(`#todelete${sb.bubble.parentElement.id}`).forEach(e => e.remove());
        //}
        
        const charRect = sb.bubble.parentElement.getBoundingClientRect();
        const charMidX = charRect.left + charRect.width / 2;
        const charMidY = charRect.top + charRect.height / 2;
        
        const faceStyle = getComputedStyle(sb.face);
        const r = parseFloat(faceStyle.borderRadius);
        const mrgComp = parseFloat(faceStyle.marginTop);
        
        const faceRect = sb.face.getBoundingClientRect();
        const w = faceRect.width;
        const facecharMidX = faceRect.left + w / 2;
        
        const a = charMidX - facecharMidX;
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
        const [x, y] = direction.map(v => v * (c - r));
        
        const path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", `M${(w-r*1.5)/2} 0C${(w-r*1.5)/2} 0 ${w*.5} 0 ${x+w*.5} ${y}C${w*.5} 0 ${(w+r*1.5)/2} 0 ${(w+r*1.5)/2} 0`);
        this.svg.appendChild(path);
        
        /**
        const createPoint = (x, y) => {
            const p = document.createElement("i");
            p.style = `position: fixed; z-index: 1000; top: ${y-2.5}px; left: ${x-2.5}px; background: orange; width: 5px; height: 5px; border-radius: 5px`;
            p.id = "todelete";
            document.body.appendChild(p);
        }
        //createPoint(facecharMidX, faceRect.bottom - faceRect.height);
        //createPoint(charMidX, charMidY);
        //createPoint(facecharMidX + x, faceRect.bottom + y - faceRect.height);
        /**
        const createLine = (x1, y1, x2, y2, color="red") => {
            const w = Math.abs(x1 - x2);
            const h = Math.abs(y1 - y2);
            //console.info([x1, y1], [x2, y2], color, [w, h]);
            const bx = Math.min(x1, x2);
            const by = Math.min(y1, y2);
            const svg = document.createElementNS(xmlns, "svg");
            svg.setAttribute("xmlns", xmlns);
            svg.setAttribute("width", Math.max(2, w));
            svg.setAttribute("height", Math.max(2, h));
            svg.setAttribute("viewBox", `0 0 ${Math.max(2, w)} ${Math.max(2, h)}`);
            svg.setAttribute("id", `todelete${sb.bubble.parentElement.id}`);
            svg.setAttribute("style", `position: fixed; z-index: 1000; stroke-width: 2px; stroke: ${color}; top: ${by}; left: ${bx}`);
            document.body.appendChild(svg);
            const p = document.createElementNS(xmlns, "path");
            p.setAttribute("d", `M${x1-bx} ${y1-by}L${x2-bx} ${y2-by}`);
            svg.appendChild(p);
        }
        const bodyRect = document.body.getBoundingClientRect();
        const midX = bodyRect.width / 2;
        const midY = bodyRect.height / 2;
        //createLine(facecharMidX, faceRect.bottom - faceRect.height, charMidX, charMidY);
        //const faceRect = this.svg.parentElement.querySelector(".face").getBoundingClientRect();
        
        const bordBias = 2 * parseFloat(getComputedStyle(sb.face).borderWidth);
        createLine(charMidX, faceRect.bottom + y, charMidX, faceRect.bottom, `#5f5`);
        const main = SB.bubbles
        .filter(sb => sb.bubble.getBoundingClientRect().top > this.svg.parentElement.getBoundingClientRect().top)
        .reduce((last, sb) => {
            const sbH = sb.face.getBoundingClientRect().height;
            const x = charMidX;
            const y1 = last;
            const y2 = last - sbH;
            const y3 = last - sbH - r;
            return y3;
        }, faceRect.bottom);
        SB.bubbles
        .filter(sb => sb.bubble.getBoundingClientRect().top > this.svg.parentElement.getBoundingClientRect().top)
        .reduce((last, sb) => {
            const sbH = sb.face.getBoundingClientRect().height;
            const x = charMidX;
            const y1 = last;
            const y2 = last + sbH + r;
            const y3 = last + r;
            createLine(x, y3, x, y2, `blue`);
            createLine(x, y2, x, y1, `#5ff`);
            return y3;
        }, faceRect.bottom);
        createLine(charMidX, faceRect.bottom, charMidX, faceRect.bottom - faceRect.height, `#f5f`);
        createLine(charMidX, faceRect.bottom, charMidX, faceRect.bottom - faceRect.height - sb.mrgComp, `#f55`);
        /**
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
        //createCircle(charMidX, charMidY, r);
        //*/
    }
}
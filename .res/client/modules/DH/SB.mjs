/* Speech Bubble */

import SW from "./SW.mjs"
import CO from "./CO.mjs";
import { VSE, VPE, VCE } from "../PL/VE.mjs";


export default class SB { // Speech Bubble
    
    static bubbles = [];
    static get active() {
        return this.bubbles.find(sb => sb.writer.writing);
    }
    static getByChar(char) {
        return SB.bubbles.find(sb => sb.char === char);
    }
    static jump() {
        this.bubbles.forEach(sb => sb.jump());
    }
    static hit() {
        this.bubbles.forEach(sb => sb.hit());
    }
    static remove() {
        this.bubbles.forEach(sb => sb.remove());
    }
    
    constructor(char) {
        SB.jump();
        SB.bubbles.push(this);
        this.char = char;
        this.body = document.createElement("div");
        this.body.className = "hidden sb-body";
        char.el.appendChild(this.body);
        this.face = new Text();
        this.body.appendChild(this.face);
        this.writer = new SW(this);
        this.tail = new ST(this);
        this.#flyOut();
        this.#startDrawing();
        this.#startColliding();
    }
    
    get text() {
        return this.face.nodeValue;
    }
    set text(str) {
        this.face.nodeValue = str;
    }
    
    get lifes() {
        return this.__lifes;
    }
    set lifes(lifes) {
        this.__lifes = lifes;
        this.char.el.style.zIndex = 90 + lifes;
    }
    
    #flyOut() {
        const rad = Math.PI / 4 + Math.random() * Math.PI / 2;
        const x = Math.cos(rad);
        const y = -(Math.sin(rad) + 1) / 2;
        void this.body.offsetWidth;
        this.body.classList.remove("hidden");
        this.body.style.left = `calc(${x} * 2 * var(--sb-size))`;
        this.body.style.top = `calc(${y} * 2 * var(--sb-size))`;
    }
    
    #startDrawing() {
        const style = getComputedStyle(this.body);
        const minW = parseFloat(style.minWidth);
        const pad = parseFloat(style.paddingLeft);
        const w = minW + pad * 2;
        const h = parseFloat(style.minHeight);
        this.drawInterval = setInterval(() => {
            this.tail.update();
            const rect = this.body.getBoundingClientRect();
            this.growCompX = (w - rect.width) / 2;
            this.growCompY = h - rect.height;
        }, 1/30 * 1000);
    }
    
     #startColliding() {
        const anchor = this.char.anchor.getBoundingClientRect();
        this.vx = 0;
        setTimeout(() => {
            this.initial = this.body.getBoundingClientRect();
            const initMidX = this.initial.left + this.initial.width / 2;
            const initMidY = this.initial.top + this.initial.height / 2;
            this.x = initMidX - anchor.left;
            this.y = anchor.top - initMidY;
            this.translationX = 0;
            this.#setCollisionInterval();
        }, 0.4 * 1000);
    }
    
    #setCollisionInterval() {
        this.collisionInterval = setInterval(() => {
            const rect = this.body.getBoundingClientRect();
            const pageW = document.body.offsetWidth;
            const dirX = rect.left < pageW * .02 ? 1
                : rect.right > pageW * .98 ? -1
                : 0;
            const step = Math.min(1, Math.abs(this.vx));
            const back = -Math.sign(this.vx);
            this.vx += dirX / 4 || step * back / 2;
            this.translationX += this.vx;
            this.body.style.left = `${this.x + this.growCompX + this.translationX}px`;
        
            const style = getComputedStyle(this.body);
            const sizeStyle = parseFloat(style.minHeight);
            const size = Number.isNaN(sizeStyle) ? 0 : sizeStyle
            const mrg = size / 2;
            const fromBelow = SB.bubbles.reduce((h, sb) => {
                const sbRect = sb.body.getBoundingClientRect();
                if (sbRect.top < rect.top) return h;
                return h + sbRect.height + mrg;
            }, this.y)
            this.body.style.bottom = `${fromBelow + size + this.growCompY}px`;
        }, 1/30 * 1000);
    }
    
    jump() {
        const style = getComputedStyle(this.body);
        const size = parseFloat(style.minHeight);
        const bot = parseFloat(style.bottom);
        clearInterval(this.collisionInterval);
        setTimeout(() => {
            this.body.style.bottom = `${bot + size}px`;
            setTimeout(() => {
                this.#setCollisionInterval();
            }, 0.2 * 1000);
        }, 0.1 * 1000);
    }
    
    hit() {
        if (!--this.lifes) this.remove();
    }
    
    remove() {
        const id = SB.bubbles.indexOf(this);
        SB.bubbles.splice(id, 1);
        clearInterval(this.collisionInterval);
        clearInterval(this.drawInterval);
        const rect = this.body.getBoundingClientRect();
        const anchor = this.char.anchor.getBoundingClientRect();
        this.body.style.bottom = `${rect.bottom - anchor.top}px`;
        this.tail?.svg.remove();
        this.body.classList.add("hidden");
        setTimeout(() => {
            this.char.talking = false;
            this.char.el.style.zIndex = 90;
        }, 0.2 * 1000);
        setTimeout(() => this.body.remove(), 0.4 * 1000);
    }
}


class ST { // Speech bubble Tail
    
    constructor(sb) { this.sb = sb }
    
    update() {
        this.svg?.remove()
        const anchor = this.sb.char.anchor.getBoundingClientRect();
        const rect = this.sb.body.getBoundingClientRect();
        const style = getComputedStyle(this.sb.body);
        const bordR = parseFloat(style.borderWidth) / 2;
        const r = parseFloat(style.borderRadius) * 1.5;
        const half = rect.width / 2;
        
        const a = anchor.left - (rect.left + half);
        const b = Math.max(0, anchor.top - rect.bottom);
        const c = Math.sqrt(a**2 + b**2);
        
        const beyond = Math.max(0, Math.abs(a) - half + bordR);
        const w = rect.width + beyond;

        this.svg = new VSE([w, b], { cn: "sb-tail", parent: this.sb.body }).el;
        this.svg.style.left = `calc(${-beyond * (a < 0)}px)`;
        
        if (c < r || !b) return;
        
        const rad = Math.atan2(b, a);
        const dir = [Math.cos(rad), Math.sin(rad)];
        const [raw, y] = dir.map(v => v * (c - r));
        
        const bias = beyond * (a < 0);
        
        const mid = bias + half;
        const left = mid - r / 2;
        const right = mid + r / 2;
        
        const x = mid + raw;
        
        const d = `M${left} 0C${left} 0 ${mid} 0 ${x} ${y} ${mid} 0 ${right} 0 ${right} 0`;
        new VPE(d, { parent: this.svg });
        
        /**/
        const cn = "balda" + this.sb.char.name;
        new VCE(1, { cn, x: left, y: 0, parent: this.svg });
        new VCE(1, { cn, x: mid, y: 0, parent: this.svg });
        new VCE(1, { cn, x, y, parent: this.svg });
        new VCE(1, { cn, x: right, y: 0, parent: this.svg });
        document.querySelectorAll(`.${cn}`).forEach((x, i) => {
            x.setAttribute("fill", ["blue", "magenta","white", "red"][i]);
        });
        /**/
    }
}

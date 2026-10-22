/* Speech Bubble */

import SF from "./SF.mjs"
import CO from "./CO.mjs";
import { VSE, VPE } from "../PL/VE.mjs";


export default class SB { // Speech Bubble
    
    static bubbles = [];
    static get active() {
        return this.bubbles.find(sb => sb.face.writing);
    }
    static hit() {
        this.bubbles.forEach(sb => sb.hit());
    }
    static remove() {
        this.bubbles.forEach(sb => sb.remove());
    }
    
    constructor(char) {
        SB.bubbles.push(this);
        this.char = char;
        this.body = document.createElement("div");
        this.body.className = "hidden bubble";
        this.face = new SF(this);
        this.body.appendChild(this.face.el);
        this.#flyOut();
        this.#startDrawing();
        this.#startColliding();
    }
    
    #flyOut() {
        const rad = Math.PI / 4 + Math.random() * Math.PI / 2;
        const x = Math.cos(rad);
        const y = Math.sin(rad) / 2 + .5;
        setTimeout(() => {
            this.body.classList.remove("hidden");
            this.body.style.left = `calc(${x} * 30 * var(--sub-axis))`;
            this.body.style.top = `calc(${-y} * 30 * var(--sub-axis))`;
        }, 1/60 * 1000);
    }
    
    #startDrawing() {
        const faceStyle = getComputedStyle(this.face.el);
        const minW = parseFloat(faceStyle.minWidth);
        const pad = parseFloat(faceStyle.paddingLeft);
        console.log(this.face.el.style.getPropertyValue("--bub-size"))
        console.log({minW: faceStyle.minWidth, pad: faceStyle.paddingLeft});
        const r = parseFloat(faceStyle.borderRadius);
        this.drawInterval = setInterval(() => {
            this.tail = new ST(this);
            this.char.el.style.zIndex = this.lifes + 90;
            const faceRect = this.face.el.getBoundingClientRect();
            this.growCompX = (minW + pad * 2 - faceRect.width) / 2;
            this.growCompY = r - faceRect.height;
        }, 1/30 * 1000);
    }
    
     #startColliding() {
        const charRect = this.char.el.getBoundingClientRect();
        const charMidX = charRect.left + charRect.width / 2;
        const charMidY = charRect.top + charRect.height / 2;
        this.vx = 0;
        setTimeout(() => {
            this.initial = this.face.el.getBoundingClientRect();
            const initialMidY = this.initial.top + this.initial.height / 2;
            const initialMidX = this.initial.left + this.initial.width / 2;
            this.y = -Math.abs(initialMidY - charMidY);
            this.x = initialMidX - charMidX;
            this.translationX = 0;
            this.#setCollisionInterval();
        }, 0.4 * 1000);
    }
    
    #setCollisionInterval() {
        this.collisionInterval = setInterval(() => {
            const curRect = this.body.getBoundingClientRect();
            const pageW = document.body.offsetWidth;
            const dirX = curRect.left < pageW * .02 ? 1
                : curRect.right > pageW * .98 ? -1
                : 0;
            const step = Math.min(1, Math.abs(this.vx));
            const back = -Math.sign(this.vx);
            this.vx += dirX / 4 || step * back / 2;
            this.translationX += this.vx;
            this.body.style.left = this.x + this.growCompX + this.translationX + "px";
        
            const faceStyle = getComputedStyle(this.face.el);
            const mrg = parseFloat(faceStyle.borderRadius) / 2;
            const fromBelow = SB.bubbles.reduce((h, sb) => {
                const sbRect = sb.face.el.getBoundingClientRect();
                if (sbRect.top > curRect.top) return h;
                return h - sbRect.height - mrg;
            }, this.y)
            this.body.style.top = fromBelow + this.initial.height + this.growCompY + "px";
        }, 1/30 * 1000);
    }
    
    jump() {
        const faceStyle = getComputedStyle(this.face.el);
        const faceH = parseFloat(faceStyle.borderRadius);
        const bodyStyle = getComputedStyle(this.body);
        const bodyTop = parseFloat(bodyStyle.top);
        clearInterval(this.collisionInterval);
        this.char.jump();
        setTimeout(() => {
            this.body.style.top = bodyTop - faceH * 2 + "px";
            setTimeout(() => {
                this.body.style.top = bodyTop + "px";
                this.#setCollisionInterval();
            }, 0.1 * 1000);
        }, 0.1 * 1000);
    }
    
    hit() {
        this.lifes--;
        if (!this.lifes) this.remove();
    }
    
    remove() {
        const id = SB.bubbles.indexOf(this);
        SB.bubbles.splice(id, 1);
        clearInterval(this.collisionInterval);
        clearInterval(this.drawInterval);
        const faceRect = this.face.el.getBoundingClientRect();
        const charRect = this.char.el.getBoundingClientRect();
        const charMidY = charRect.top + charRect.height / 2;
        this.body.style.top = faceRect.bottom - charMidY;
        this.tail?.svg.remove();
        setTimeout(() => {
            this.body.classList.add("hidden");
            setTimeout(() => this.body.remove(), 0.4 * 1000);
        }, 1/60 * 1000);
    }
}


class ST { // Speech bubble Tail
    
    constructor(sb) {
        sb.tail?.svg.remove();
        
        const char = sb.body.parentElement;
        const charRect = sb.char.el.getBoundingClientRect();
        const charMidX = charRect.left + charRect.width / 2;
        const charMidY = charRect.top + charRect.height / 2;
        
        const faceStyle = getComputedStyle(sb.face.el);
        const r = parseFloat(faceStyle.borderRadius);
        const faceW = parseFloat(faceStyle.width);
        const faceBorder = parseFloat(faceStyle.borderWidth);
        const facePad = parseFloat(faceStyle.paddingLeft);
        const w = faceW + faceBorder * 2 + facePad * 2;
        
        const faceRect = sb.face.el.getBoundingClientRect();
        const faceMidX = faceRect.left + w / 2;
        
        const a = charMidX - faceMidX;
        const b = Math.max(charMidY - faceRect.bottom, 0);
        const c = Math.sqrt(a**2 + b**2);
        if (c < r) return;

        this.svg = new VSE([w, b], { cn: "tail", parent: sb.body });
        
        const rad = Math.atan2(b, a);
        const dir = [Math.cos(rad), Math.sin(rad)];
        const [x, y] = dir.map(v => v * (c - r));

        const d = `M${(w-r)/2} 0C${(w-r)/2} 0 ${w/2} 0 ${x+w/2} ${y}C${w/2} 0 ${(w+r)/2} 0 ${(w+r)/2} 0`;
        const path = new VPE(d, { parent: this.svg.el });
    }
}

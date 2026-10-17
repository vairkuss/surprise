/* Choice Chip */

import { VCE, VSE } from "./VE.mjs";


export class CCC { // Choice Chip Chain

    constructor() {
        this.root = document.createElement("div");
        this.root.className = "cho-chain-seg";
    }
    
    get size() { return this.root.getBoundingClientRect().width }
    get margin() { return this.size / 2 }
    
    update([chipX, chipY]) {
        const chipR = this.size / 1.5 + this.margin;
        const length = Math.sqrt(chipX**2 + chipY**2);
        const segments = Math.floor((length - chipR) / (this.size + this.margin));
        
        const diff = segments + 1 - this.root.children.length;
        if (diff > 0) this.#gain(diff);
        
        const rest = (length - chipR) % (this.size + this.margin);
        const restFraction = rest / (this.size + this.margin);
        const ghost = this.root.children[segments];
        ghost.style.filter = `opacity(${restFraction * 100}%)`;
        
        const rad = Math.atan2(chipY, chipX);
        const dir = [Math.cos(rad), Math.sin(rad)];
        const children = [...this.root.children];
        children.forEach((child, i) => {
            const dist = i * (this.size + this.margin) + rest;
            const [x, y] = dir.map(v => v * dist);
            child.style.left = x;
            child.style.top = y;
        });
    }
    
    #gain(count) {
        const seg = document.createElement("div");
        seg.className = "cho-chain-seg";
        const toAppend = Array(count).fill(seg.cloneNode());
        this.root.append(...toAppend);
    }
}


export default class CC { // Choice Chip

    constructor() {
        this.dp = null;
        
        this.base = document.createElement("div");
        this.base.id = "choice";
        this.base.className = "hidden";
        
        this.chip = document.createElement("div");
        this.chip.id = "chip";
        this.chip.textContent = "<i>...</i>";
        this.base.appendChild(this.chip);
        
        this.chipBorder = new VSE([14], { id: "chip-border", parent: this.chip });
        new VCE(6, { x: 7, parent: this.chipBorder });
        
        this.chain = new CCC();
        this.base.appendChild(this.chain.root);
    }
    
    get active() {
        return this.dp != null;
    }
    get computed() {
        return getComputedStyle(this.chip);
    }
    get cords() {
        const x = parseFloat(this.computed.left);
        const y = parseFloat(this.computed.top);
        return [x, y];
    }
    
    updateChain() { this.chain.update(this.cords) }
    
    setIcon(icon) {
        if (this.changingTo !== icon) {
            this.changingTo = icon;
            this.transition += 400;
            this.#blinkIcon();
        }
    }
    
    #blinkIcon() {
        if (this.blinking) return;
        this.blinking = 1;
        this.icon?.classList.add("hidden");
        this.chip.style.color = "transparent";
        signal.addEventListener("chipIconChanged", () => {
            this.#changeIcon();
            setTimeout(() => {
               this.icon?.classList.remove("hidden");
               this.chip.style.color = '';
               this.blinking = 0;
           }, 1/60 * 1000);
        }, { once: 1 });
        const transitionCounter = setInterval(() => {
            this.transition--;
            if (!this.transition) signal.dispatch(new Event("chipIconChanged"));
            if (this.transition <= -400) clearInterval(transitionCounter);
        }, 1);
    }
    
    #changeIcon() {
        this.chip.textContent = '';
        if (this.changingTo != null) {
            this.icon = new VSE([], {
                id: "chip-icon",
                cn: "hidden",
                parse: this.changingTo,
                parent: this.chip
            });
        } else {
            this.icon = null;
            this.chip.textContent = "<i>...</i>";
        }
    }
    
    retrieve() {
        const retrieval  = setInterval(() => {
            const nested = this.cords.every(v => !v);
            const held = this.dp != null;
            if (nested || held) return clearInterval(retrieval);
            const rad = Math.atan2(...this.cords.toReversed());
            const dir = [Math.cos(rad), Math.sin(rad)];
            const c = Math.sqrt(this.cords.reduce((s, v) => s + v**2, 0));
            const [x, y] = this.cords.map((v, i) => v - dir[i] * c / 10);
            this.chip.style.left = Math.abs(x) < .5 ? 0 : x + "px"; // найти как исправить запись
            this.chip.style.top = Math.abs(y) < .5 ? 0 : y + "px";
            this.updateChain();
        });
    }
}

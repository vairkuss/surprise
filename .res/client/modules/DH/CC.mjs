/* Choice Chip */

import { VCE, VSE } from "../PL/VE.mjs";


class CN { // Choice chip chaiN

    constructor() {
        this.root = document.createElement("div");
        this.root.className = "cho-chain-seg";
        this.ghost = this.root.cloneNode();
        this.root.appendChild(this.ghost);
    }
    
    get size() { return this.root.getBoundingClientRect().width }
    get margin() { return this.size / 2 }
    
    update([chipX, chipY]) {
        /**
        if (this.govn1) return;
        /**/
        const chipR = this.size / 1.5 + this.margin;
        const c = Math.sqrt(chipX**2 + chipY**2);
        const length = c - chipR;
        const seg = this.size + this.margin;
        const segments = Math.floor(length / seg);
        
        const diff = segments + 1 - this.root.children.length;
        if (diff > 0) this.#gain(diff);
        if (diff < 0) this.#lose(diff);
        
        const rest = length % seg;
        const restFraction = rest / seg;
        this.ghost.style.filter = `opacity(${restFraction * 100}%)`;
        
        const rad = Math.atan2(chipY, chipX);
        const dir = [Math.cos(rad), Math.sin(rad)];
        [...this.root.children].forEach((child, i) => {
            if (!i) return;
            const dist = (i - 1) * seg + rest;
            const [x, y] = dir.map(v => v * dist);
            child.style.left = x;
            child.style.top = y;
        });
        /**
        if (!this.timeoutgovn1) {
            this.timeoutgovn1 = setTimeout(() => this.govn1 = 1, 2000);
        }
        /**/
    }
    
    #gain(count) {
        for (let i = 0; i < count; i++) {
            this.root.appendChild(this.root.cloneNode());
        }
    }
    
    #lose(count) {
        for (let i = count; i < 0; i++) {
            this.root.firstChild.remove();
        }
    }
}


export default class CC { // Choice Chip

    constructor() {
        this.dp = null;
        this.transition = 0;
        
        this.base = document.createElement("div");
        this.base.id = "choice";
        this.base.className = "hidden";
        
        this.chip = document.createElement("div");
        this.chip.id = "chip";
        this.base.appendChild(this.chip);
        /**
        this.chip.style.outline = "2px solid blue";
        /**/
        this.container = document.createElement("div");
        this.container.appendChild(new Text("..."));
        this.chip.appendChild(this.container);
        
        this.border = new VSE([14], { id: "chip-border", parent: this.chip });
        new VCE(6, { x: 7, parent: this.border });
        
        this.chain = new CN();
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
            this.#blinkIcon(0.4 * 1000);
        }
    }
    
    #blinkIcon(transition) {
        this.transition += transition;
        if (this.blinking) return;
        this.blinking = true;
        this.icon?.classList.add("hidden");
        this.chip.style.color = "transparent";
        signal.addEventListener("ccChangeIcon", () => {
            this.#changeIcon();
            setTimeout(() => {
               this.icon?.classList.remove("hidden");
               this.chip.style.removeProperty("color");
               this.blinking = false;
           }, 1/60 * 1000);
        }, { once: 1 });
        const counter = setInterval(() => {
            this.transition--;
            if (!this.transition) {
                clearInterval(counter);
                const changeIcon = new Event("ccChangeIcon");
                signal.dispatchEvent(changeIcon);
            }
        }, 1);
    }
    
    #changeIcon() {
        this.container.firstChild.remove();
        if (this.changingTo == null) {
            this.icon = null;
            this.container.appendChild(new Text("..."));
        } else {
            this.icon = new VSE([], {
                id: "chip-icon",
                cn: "hidden",
                parse: this.changingTo,
                parent: this.container
            });
        }
    }
    
    retrieve() {
        /**
        if (this.chain.govn1) return;
        /**/
        const retrieval  = setInterval(() => {
            const nested = this.cords.every(v => !v);
            const held = this.dp != null;
            if (nested || held) return clearInterval(retrieval);
            const rad = Math.atan2(...this.cords.toReversed());
            const dir = [Math.cos(rad), Math.sin(rad)];
            const c = Math.sqrt(this.cords.reduce((s, v) => s + v**2, 0));
            const [x, y] = this.cords.map((v, i) => v - dir[i] * c / 10);
            this.chip.style.left = Math.abs(x) < .5 ? 0 : x + "px";
            this.chip.style.top = Math.abs(y) < .5 ? 0 : y + "px";
            this.updateChain();
        }, 1/60 * 1000);
    }
}

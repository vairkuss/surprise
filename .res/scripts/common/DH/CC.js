/* Choice Chip */

import { AF } from "AF.js";
import { VCE, VSE } from "VE.js";


class CCC { // Choice Chip Chain

    constructor() {
        this.root = document.createElement("div");
        this.root.className = "cho-chain-seg";
        this.ghost = document.createElement("div");
        this.ghost.className = "cho-chain-ghost";
    }
    
    get size() { return this.root.getBoundingClientRect().width }
    get margin() { return this.size * .5 }
    
    update([chipX, chipY]) {
        const chipR = this.size / 1.5 + this.margin;
        const rad = Math.atan2(chipY, chipX);
        const vec = [Math.cos(rad), Math.sin(rad)];
        
        const length = Math.sqrt(chipX**2 + chipY**2);
        const segments = Math.floor((length - chipR) / (this.size + this.margin));
        
        const rest = (length - chipR) % (this.size + this.margin);
        const restFraction = rest / (this.size + this.margin);
        this.ghost.style.filter = `opacity(${restFraction * 100}%)`;
        
        const diff = this.root.children.length - segments;
        if (diff < 0) { this.#gain(Math.abs(diff)) }
        else if (diff > 0) { this.#lose(diff) }
        
        [...this.root.children].forEach((seg, i) => {
            const dist = i * (this.size + this.margin) + rest;
            const [x, y] = [0, 1].map(v => vec[v] * dist);
            seg.style.left = x;
            seg.style.top = y;
        });
    }
    
    #gain(count) {
        const seg = document.createElement("div");
        seg.className = "cho-chain-seg";
        [...Array(count)].forEach(_ => this.root.appendChild(seg.cloneNode()));
    }
    
    #lose(count) {
        [...this.root.children].splice(0, count).forEach(seg => seg.remove());
    }
}


class CC { // Choice Chip

    constructor() {
        this.dp = null;
        
        this.base = document.createElement("div");
        this.base.id = "choice";
        this.base.className = "hidden";
        
        this.chip = document.createElement("div");
        this.chip.id = "chip";
        this.base.appendChild(this.chip);
        
        this.chipText = document.createElement("span");
        this.chipText.id = "chip-icon";
        this.chipText.textContent = "...";
        this.chip.appendChild(this.chipText);
        
        this.chipBorder = new VSE([14], { id: "chip-border", parent: this.chip });
        new VCE([6, 7], { parent: this.chipBorder });
        
        this.chain = new CCC();
        this.base.appendChild(this.chain.root);
        this.base.appendChild(this.chain.ghost);
    }
    
    get active() { return this.dp != null }
    get style() { return getComputedStyle(this.chip) }
    get classes() { return this.base.className.split(" ").filter(cn => cn) }
    get cords() { return [parseFloat(this.style.left), parseFloat(this.style.top)] }
    
    updateChain() { this.chain.update(this.cords) }
    
    addClass(addCN) {
        if (this.base.className.includes(addCN)) { return }
        this.base.className = this.classes.concat([addCN]).join(" ");
    }
    
    removeClass(rmCN) {
        this.base.className = this.classes.filter(cn => cn !== rmCN).join(" ");
    }
    
    setIcon(icon) {
        if (this.changingTo !== icon) {
            this.changingTo = icon;
            this.changedAt = Date.now();
            this.blinkIcon(() => this.changeIcon());
        }
    }
    
    blinkIcon(func) {
        if (this.blinking) { return }
        this.blinking = 1;
        this.icon?.addClass("hidden");
        this.chip.style.color = "transparent";  
        AF.holdUntill(30, () => Date.now() - this.changedAt >= 400, () => {
            if (func) { func() }
            AF.delay(1/60, () => {
               this.icon?.removeClass("hidden");
               this.chip.style.color = "";
               this.blinking = 0;
           });
        });
    }
    
    changeIcon() {
        this.icon?.remove();
        if (this.changingTo !== undefined) {
            this.icon = new VSE([], { id: "chip-icon", cn: "hidden", fromString: this.changingTo, parent: this.chip });
            this.chipText.textContent = "";
        } else {
            this.icon = undefined;
            this.chipText.textContent = "...";
        }
    }
    
    retrieve() {
        const rad = () => Math.atan2(...this.cords.toReversed());
        const direction = () => [Math.cos(rad()), Math.sin(rad())];
        AF.repeatUntill(1/60, () => this.cords.every(v => !v) || this.dp != null, () => {
            const c = Math.sqrt(this.cords.reduce((s, v) => s + v**2, 0));
            const [x, y] = this.cords.map((v, i) => v - direction()[i] * c / 10);
            this.chip.style.left = Math.abs(x) < .5 ? 0 : x + "px";
            this.chip.style.top = Math.abs(y) < .5 ? 0 : y + "px";
            this.updateChain();
        });
    }
}

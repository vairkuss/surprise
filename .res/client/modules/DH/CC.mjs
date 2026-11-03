/* Choice Chip */

import { VCE, VSE } from "../PL/VE.mjs";


class CN { // Choice chip chaiN

    constructor() {
        this.root = document.createElement("div");
        this.root.className = "cho-chain-seg";
        this.ghost = this.root.cloneNode();
        this.ghost.id = "cho-chain-ghost";
        this.root.appendChild(this.ghost);
    }
    
    get size() { return this.root.getBoundingClientRect().width }
    get margin() { return this.size / 2 }
    
    update([chipX, chipY]) {
        const chipR = this.size / 1.5 + this.margin;
        const c = Math.sqrt(chipX**2 + chipY**2);
        const length = Math.max(0, c - chipR);
        const seg = this.size + this.margin;
        const segments = Math.floor(length / seg);
        
        const diff = segments + 1 - this.root.children.length;
        
        for (let i = 0; i < Math.abs(diff); i++) {
            if (diff > 0) this.root.appendChild(this.root.cloneNode());
            if (diff < 0) this.root.lastChild.remove();
        }
           
        const rest = length % seg;
        this.ghost.style.filter = `opacity(${rest / seg})`;
        
        const rad = Math.atan2(chipY, chipX);
        const dir = [Math.cos(rad), Math.sin(rad)];
        const toMove = ".cho-chain-seg:not(#cho-chain-ghost)";
        [...this.root.querySelectorAll(toMove)].forEach((child, i) => {
            const dist = i * seg + rest;
            const [x, y] = dir.map(v => v * dist);
            child.style.left = `${x}px`;
            child.style.top = `${y}px`;
        });
    }
}


export default class CC { // Choice Chip

    constructor() {
        this.dp = null;
        this.transition = 0;
        
        this.base = document.createElement("div");
        this.base.id = "choice";
        this.base.className = "antifreeze hidden";
        
        this.chip = document.createElement("div");
        this.chip.id = "chip";
        this.base.appendChild(this.chip);
        this.#assignAnim(this.chip);
        
        this.container = document.createElement("div");
        this.container.appendChild(new Text("..."));
        this.chip.appendChild(this.container);
        
        this.border = new VSE([14], { id: "chip-border", parent: this.chip });
        new VCE(6, { x: 7, parent: this.border });
        this.#assignAnim(this.border.el);
        
        this.chain = new CN();
        this.base.appendChild(this.chain.root);
    }
    
    #assignAnim(el) {
        const pulse = [
            { filter: "brightness(1)" },
            { filter: "brightness(0.6)" },
            { filter: "brightness(1.3)" },
            { filter: "brightness(1)" }
        ];
        const conf = {
            duration: 4000,
            easing: "ease-in-out",
            iterations: Infinity
        };
        const anim = el.animate(pulse, conf);
        new MutationObserver((records) => {
            for (const record of records) {
                if (record.attributeName !== "class") continue;
                if (this.base.matches(".active")) {
                    return anim.play();
                }
                const current = anim.currentTime % conf.duration;
                const left = conf.duration - current;
                anim.effect.updateTiming({
                    iterations: 1,
                    duration: left
                });
            }
        }).observe(this.base, { attributes: 1 });
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
    
    #blinkIcon(wait) {
        this.blinking = true;
        this.icon?.classList.add("hidden");
        this.chip.style.color = "transparent";
        signal.addEventListener("ccChangeIcon", () => {
            this.#changeIcon();
            this.icon?.classList.remove("hidden");
            this.chip.style.removeProperty("color");
            this.blinking = false;
        }, { once: 1 });
        if (this.transition) clearTimeout(this.transition);
        this.transition = setTimeout(() => {
            this.transition = null;
            const changeIcon = new Event("ccChangeIcon");
            signal.dispatchEvent(changeIcon);
        }, wait);
    }
    
    #changeIcon() {
        this.container.firstChild.remove();
        if (!this.changingTo) {
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
        const retrieve = setInterval(() => {
            const nested = this.cords.every(v => !v);
            const held = this.dp != null;
            if (nested || held) return clearInterval(retrieve);
            const rad = Math.atan2(...this.cords.toReversed());
            const dir = [Math.cos(rad), Math.sin(rad)];
            const c = Math.sqrt(this.cords.reduce((s, v) => s + v**2, 0));
            const [x, y] = this.cords.map((v, i) => v - dir[i] * c / 10);
            this.chip.style.left = Math.abs(x) < .5 ? 0 : x + "px";
            this.chip.style.top = Math.abs(y) < .5 ? 0 : y + "px";
            if(!this.base.matches(".hidden")) {
                this.updateChain();
            }
        }, 1/60 * 1000);
    }
}

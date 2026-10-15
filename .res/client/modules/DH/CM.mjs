/* Choice Menu */

import AF from "./AF.mjs"
import VE, { VPE, VRE, VSE } from "./VE.mjs"


class DC { // Data Calculator
    
    static dir(rad) {
        return [Math.cos(rad), -Math.sin(rad)];
    }
    
    static cords(rad, l, bias) {
         return this.dir(rad).map((v, i) => v * l + bias);
     }
    
    static dividerD(rad, { inR, outR, divW }) {
        const [xI, yI] = this.cords(rad, inR + divW / 2, outR);
        const [xO, yO] = this.cords(rad, outR - divW / 2, outR);
        return `M${xI} ${yI}L${xO} ${yO}`;
    }
    
    static fieldD(dirs, { inR, outR }) {
        const cordsO = dirs.map(rad => {
            return this.cords(rad, outR, outR);
        });
        const cordsI = dirs.toReversed().map(rad => {
            return this.cords(rad, inR, outR);
        });
        const cords = cordsO.concat(cordsI);
        return cords.reduce((d, pair, i) => {
            return d + (i ? 'L' : 'M') + pair.join(' ');
        }, '') + 'z';
    }
}


class CS { // Choice Wheel Sector

    constructor(key, value, sizes, i, a) {
        this.text = key;
        this.value = value;
        this.#calculateColor(key)
        .then(() => this.#fetchIcon());
        this.#generateSector(sizes, i, a);
    }
    
    async #calculateColor(key) {
        this.color = "#000";
        const bytes = new TextEncoder().encode(key);
        const hash = await crypto.subtle.digest("SHA-256", bytes);
        const rgb = hash.slice(0, 3);
        this.color = "#" + new Uint8Array(rgb).toHex();
    }
    
    #fetchIcon() {
        const name = this.value == null ? "x"
            : typeof this.value !== "number" ? "sb"
            : this.value < 0 ? "pat"
            : null;
        if (name != null) {
            this.icon = window.data.icons.named[name];
        } else {
            const random = Object.values(window.data.icons.random);
            const hex = this.color.slice(1);
            const number = parseInt(hex, 16);
            const index = number % random.length;
            this.icon = random[index];
        }
    }
    
    #generateSector(sizes, i, a) {
        const cuts = 180 / 5 / a.length;
        const dirs = Array.from({ length: cuts + 1 }, (_, cut) => {
            const part = cut / cuts;
            return Math.PI * (i + part) / a.length;
        });
        const fieldD = DC.fieldD(sizes);
        this.field = new VPE(fieldD, { id: `id${i}`, cn: "cho-field" });
        const dividerD = DC.dividerD(dirs[0], sizes);
        this.divider = new VPE(dividerD, { cn: "cho-divider" });
    }
    
    activate() { this.field.classList.add("active") }
    deactivate() { this.field.classList.remove("active") }
}


class CW { // Choice Wheel

    constructor(base, choices) {
        this.#calcSizes(base);
        this.#genBody(base);
        this.#genNegMask();
        this.#placeInactive();
        this.#genGrad("-inactive");
        this.#genGrad();
        const keys = this.#shuffleKeys(choices);
        this.#appendSectors(keys, choices);
        this.#appendLastDivider();
    }
    
    #calcSizes(base) {
        const baseStyle = getComputedStyle(base);
        const baseSize = parseFloat(baseStyle.height);
        this.sizes = {};
        this.sizes.divW = baseSize / 5;
        this.sizes.inR = baseSize / 2 + this.sizes.divW * 2;
        this.sizes.outR = baseSize * 3;
    }
    
    #genBody(base) {
        const baseStyle = getComputedStyle(base);
        const w = this.sizes.outR * 2;
        const h = this.sizes.outR + this.sizes.divW / 2;
        this.body = new VSE([w, h], { id: "cho-wheel", fill: "url(#cho-wheel-grad)" });
        this.body.setAttribute("style",
            `bottom: calc(${baseStyle.bottom} + var(--cho-size) * 0.4);` +
            `left: ${root.offsetWidth / 2 - this.sizes.outR};`
        );
    }
    
    #genNegMask() {
        const negMask = new VE("mask", { id: `${this.body.mask.id}-neg`, parent: this.body.defs.el });
        const children = [...this.body.mask.children];
        children.forEach(child => {
            const use = new SVGUE(child.getAttribute("href"), { parent: negMask.el });
            use.setAttribute("style", "filter: invert(1)");
        });
    }
    
    #placeInactive() {
        const rect = new VRE(["100%", "100%"], { parent: this.body });
        rect.setAttribute("mask", `url(#${this.body.mask.id}-neg)`);
        rect.setAttribute("fill", "url(#cho-wheel-grad-inactive)");
    }
    
    #genGrad(name='') {
        const gradient = new VE("radialGradient", { id: `cho-wheel-grad${name}` });
        gradient.setAttributes(
            ["gradientUnits", "userSpaceOnUse"],
            ["cx", this.sizes.outR],
            ["cy", this.sizes.outR],
            ["fr", this.sizes.inR],
            ["r", this.sizes.outR]
        );
        const colors = document.getElementById(`cho-wheel-grad${name}-colors`);
        gradient.cloneChildren(colors);
        gradient.appendTo(this.body.defs.el);
    }
    
    #shuffleKeys(choices) {
        return Object.keys(choices).reduce((arr, key) => {
            arr.splice((arr.length + 1) * Math.random(), 0, key);
            return arr;
        }, []);
    }
    
    #appendSectors(keys, choices) {
        this.fields = keys.map((key, i, a) => {
            const cs = new CS(key, choices[key], this.sizes, i, a);
            this.body.addToMask(cs.field.el);
            cs.divider.appendTo(this.body);
            return cs;
        });
    }
    
    #appendLastDivider() {
        const d = DC.dividerD(Math.PI, this.sizes);
        new VPE(d, { cn: "cho-divider", parent: this.body });
    }
}


export default class CM { // Choice Menu

    constructor(choices) {
        this.menu = document.createElement("div");
        this.menu.id = "cho-menu";
        this.choices = choices;
        this.hide();
    }
        
    updateMenu() {
        this.wheel?.body.remove();
        this.text?.remove();
        const base = this.menu.parentElement;
        if (!base) return;
        this.wheel = new CW(base, this.choices);
        this.wheel.body.appendTo(this.menu);
        this.text = document.createElement("pre");
        this.text.id = "cho-text";
        const wheelStyle = getComputedStyle(this.wheel.body.el);
        const wheelBottom = parseFloat(wheelStyle.bottom);
        this.text.style.bottom = wheelBottom + this.wheel.sizes.outR + "px";
        this.menu.appendChild(this.text);
    }
    
    blinkText(func) {
        this.text.classList.add("hidden");
        setTimeout(() => {
            if (func) func();
            this.text.classList.remove("hidden");
        }, 400);
    }
    
    show() {
        this.updateMenu();
        this.menu.classList.remove("hidden");
    }
    
    hide() {
        this.menu.classList.add("hidden");
    }
}

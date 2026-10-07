/* Choice Menu */

import { AF } from "AF.js"
import { DC } from "DC.js"
import { VE, VPE, VRE, VSE } from "VE.js"


class CWS { // Choice Wheel Sector

    constructor(key, value, vault, sizes, i, a) {
        this.text = key;
        this.value = value;
        this.#calculateColor(key)
        .then(() => this.#fetchIcon(vault));
        this.#generateSector(sizes, i, a);
    }
    
    async #calculateColor(key) {
        this.color = "#000";
        const bytes = new TextEncoder().encode(key);
        crypto.subtle.digest("SHA-256", bytes).then(hash => {
            this.color = "#" + new Uint8Array(hash.slice(0, 3)).toHex();
        });
    }
    
    async #fetchIcon(vault) {
        const iconName = this.value == null ? "x"
            : typeof this.value !== "number" ? "sb"
            : this.value < 0 ? ["pat", "wag"].at(~this.value) ?? "sb"
            : null;
        this.icon = iconName != null ? this.icon = vault.icon[iconName]
            : vault.randomIcon(parseInt(this.color.slice(1), 16));
    }
    
    async #generateSector(sizes, i, a) {
        const fieldD = this.#calculateFieldData(sizes, i, a, 180 / 5 / a.length);
        this.field = new VPE(fieldD, { id: `id${i}`, cn: "cho-field" });
        const dividerD = this.calculateDividerData(directions[0], sizes);
        this.divider = new VPE(dividerD, { cn: "cho-divider" });
    }
    
    #calculateFieldData(sizes, i, a, cuts) {
        const directions = [...Array(cuts + 1)].map((_, cut) => cut / cuts)
        .map(part => Math.PI * (i + part) / a.length);
        const cords = directions.map(dir => DC.cords(dir, sizes.outR, sizes.outR))
        .concat(directions.toReversed().map(dir => DC.cords(dir, sizes.inR, sizes.outR)));
        return cords.map((pair, i) => (i ? "L" : "M") + pair.join(" ")).join("") + "z";
    }
    
    calculateDividerData(dir, sizes) {
        const [xI, yI] = DC.cords(dir, sizes.inR + sizes.divW * .5, sizes.outR);
        const [xO, yO] = DC.cords(dir, sizes.outR - sizes.divW * .5, sizes.outR);
        return `M${xI} ${yI}L${xO} ${yO}`;
    }
    
    activate() { this.field.addClass("active") }
    deactivate() { this.field.removeClass("active") }
}


class CW { // Choice Wheel

    constructor(base, choices, vault) {
        this.#calcSizes(base);
        this.#genBody(base);
        this.#genNegMask();
        this.#placeInactive();
        this.#genGrad("-inactive");
        this.#genGrad("");
        const keys = this.#shuffleKeys(choices);
        this.#appendSectors(keys, choices, vault);
        this.#appendLastDivider();
    }
    
    #calcSizes(base) {
        const baseSize = parseFloat(getComputedStyle(base).height);
        this.sizes = {};
        this.sizes.divW = baseSize / 5;
        this.sizes.inR = baseSize / 2 + this.sizes.divW * 2;
        this.sizes.outR = baseSize * 3;
    }
    
    #genBody(base) {
        const bodyRect = document.body.getBoundingClientRect();
        this.body = new VSE([this.sizes.outR * 2, this.sizes.outR + this.sizes.divW / 2], { id: "cho-wheel", fill: "url(#cho-wheel-grad)" });
        this.body.setAttribute("style",
            `bottom: calc(${getComputedStyle(base).bottom} + var(--cho-size) * 0.4);` +
            `left: ${bodyRect.width / 2 - this.sizes.outR};`
        );
    }
    
    #genNegMask() {
        const negMask = new VE("mask", { id: `${this.body.mask.id}-neg`, parent: this.body.defs.el });
        const children = () => [...this.body.mask.children];
        AF.holdUntill(30, () => children().length, () => {
            children().forEach(child => {
                const use = new SVGUE(child.getAttribute("href"), { parent: negMask.el });
                use.setAttribute("style", "filter: invert(1)");
            });
        });
    }
    
    #placeInactive() {
        const rect = new VRE(["100%", "100%"], { parent: this.body });
        rect.setAttribute("mask", `url(#${this.body.mask.id}-neg)`);
        rect.setAttribute("fill", "url(#cho-wheel-grad-inactive)");
    }
    
    #genGrad(name) {
        const gradient = new VE("radialGradient", { id: `cho-wheel-grad${name}` });
        gradient.setAttributes(
            ["gradientUnits", "userSpaceOnUse"],
            ["cx", this.sizes.outR],
            ["cy", this.sizes.outR],
            ["fr", this.sizes.inR],
            ["r", this.sizes.outR]
        );
        const colors = () => document.getElementById(`cho-wheel-grad${name}-colors`);
        AF.holdUntill(30, () => colors() != null, () => {
            gradient.cloneChildren(colors());
            gradient.appendTo(this.body.defs.el);
        });
    }
    
    #shuffleKeys(choices) {
        return Object.keys(choices).reduce((arr, key) => {
            arr.splice((arr.length + 1) * Math.random(), 0, key);
            return arr;
        }, []);
    }
    
    #appendSectors(keys, choices, vault) {
        this.fields = keys.map((key, i, a) => {
            const cws = new CWS(key, choices[key], vault, this.sizes, i, a);
            AF.holdUntill(30, () => cws.field != null, () => this.body.addToMask(cws.field.el));
            AF.holdUntill(30, () => cws.divider != null, () => cws.divider.appendTo(this.body));
            return cws;
        });
    }
    
    #appendLastDivider() {
        const d = CWS.prototype.calculateDividerData(Math.PI, this.sizes);
        new VPE(d, { cn: "cho-divider", parent: this.body });
    }
}


class CM { // Choice Menu

    constructor(choices) {
        this.menu = document.createElement("div");
        this.menu.id = "cho-menu";
        this.choices = choices;
        this.hide();
    }
        
    updateMenu(vault) {
        this.wheel?.body.remove();
        this.text?.remove();
        const base = this.menu.parentElement;
        if (!base) { return }
        this.wheel = new CW(base, this.choices, vault); 
        AF.holdUntill(30, () => this.wheel.body != null, () => {
            this.wheel.body.appendTo(this.menu);
            this.text = document.createElement("pre");
            this.text.id = "cho-text";
            const wheelStyle = getComputedStyle(this.wheel.body.el);
            const wheelBottom = parseFloat(wheelStyle.bottom);
            this.text.style.bottom = wheelBottom + this.wheel.sizes.outR + "px";
            this.menu.appendChild(this.text);
        });
    }
    
    blinkText(func) {
        this.text.className = "hidden cho-text";
        AF.delay(.4, () => {
            if (func) { func() }
            this.text.className = "cho-text";
        });
    }
    
    show(vault) {
        this.updateMenu(vault);
        const classes = this.menu.className.split(" ").filter(cn => cn);
        this.menu.className = classes.filter(cn => cn !== "hidden").join(" ");
    }
    
    hide() {
        if (this.menu.className.includes("hidden")) { return }
        const classes = this.menu.className.split(" ").filter(cn => cn);
        this.menu.className = classes.concat(["hidden"]).join(" ");
    }
}

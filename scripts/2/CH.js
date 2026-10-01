/* AF DECC */
/* SVGNSE SB! */
/* Choice Handler */

class CCC { // Choice Chip Chain
    constructor() {
        this.root = document.createElement("div");
        this.root.className = "cho-chain-seg";
        this.ghost = document.createElement("div");
        this.ghost.className = "cho-chain-ghost";
    }
    
    get size() {
        const rect = this.root.getBoundingClientRect();
        return rect.width;
    }
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
        
        this.chipBorder = new SVGE([14], { id: "chip-border", parent: this.chip });
        new SVGCE([6, 7], { parent: this.chipBorder });
        
        this.chain = new CCC();
        this.base.appendChild(this.chain.root);
        this.base.appendChild(this.chain.ghost);
    }
    
    get active() { return this.dp != null }
    
    addClass(className) {
        if (this.base.className.includes(className)) { return }
        this.base.className = this.base.className.split(" ").filter(cn => cn).concat([className]).join(" ");
    }
    
    removeClass(className) {
        this.base.className = this.base.className.split(" ").filter(cn => cn && cn !== className).join(" ");
    }
    
    updateChain() {
        this.chain.update(this.cords);
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
            this.icon = new SVGE([], { id: "chip-icon", cn: "hidden", fromString: this.changingTo, parent: this.chip });
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
    
    get style() {
        return getComputedStyle(this.chip);
    }
    
    get cords() {
        return [parseFloat(this.style.left), parseFloat(this.style.top)]
    }
}


class CWS { // Choice Wheel Sector

    constructor(key, value, sizes, i, a) {
        this.text = key;
        this.value = value;
        this.#calculateColor(key);
        this.#fetchIcon(value);
        this.#generateSector(sizes, i, a);
    }
    
    async #calculateColor(key) {
        this.color = "#000";
        const bytes = new TextEncoder().encode(key);
        crypto.subtle.digest("SHA-256", bytes).then(hash => {
            this.color = "#" + new Uint8Array(hash.slice(0, 3)).toHex();
        });
    }
    
    async #fetchIcon(value) {
        const iconName = value == null ? "x"
            : typeof(value) !== "number" ? "sb"
            : value < 0 ? ["pat", "wag"].at(~value) ?? "sb"
            : null;
        if (iconName != null) {
            const path = `res/icons/${iconName}.svg`
        } else {
            const bytes = new TextEncoder().encode(JSON.stringify(value));
            const seed = [...bytes].reduce((sum, add) => sum + add, 0);
            const path = `get/random_icon?s=${seed}`
        }
        //fetch("http://localhost:7148/" + path)
        //.then(async res => this.icon = await res.text());
        this.icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 13.5 14 8A1 1 0 0 0 8 4 1 1 0 0 0 2 8z" fill="currentColor" /></svg>`;
    }
    
    async #generateSector(sizes, i, a) {
        const directions = this.#generateDirections(i, a, 180 / 5 / a.length);
        const cords = this.#calculateCords(directions, sizes);
        const fieldD = this.#gatherFieldData(cords);
        this.field = new SVGPE(fieldD, { id: `id${i}`, cn: "cho-field" });
        const dividerD = this.calculateDividerData(directions[0], sizes);
        this.divider = new SVGPE(dividerD, { cn: "cho-divider" });
    }
    
    #generateDirections(i, a, sectors) {
        return [...Array(sectors + 1)].map((_, sector) => sector / sectors)
        .map(part => Math.PI * (i + part) / a.length);
    }
    
    #calculateCords(directions, sizes) {
        return directions.map(dir => DECC.cords(dir, sizes.outR, sizes.outR))
        .concat(directions.toReversed().map(dir => DECC.cords(dir, sizes.inR, sizes.outR)));
    }
    
    #gatherFieldData(cords) {
        return cords.map((pair, i) => (i ? "L" : "M") + pair.join(" ")).join("") + "z"
    }
    
    calculateDividerData(dir, sizes) {
        const [xI, yI] = DECC.cords(dir, sizes.inR + sizes.divW * .5, sizes.outR);
        const [xO, yO] = DECC.cords(dir, sizes.outR - sizes.divW * .5, sizes.outR);
        return `M${xI} ${yI}L${xO} ${yO}`;
    }
    
    activate() { this.field.addClass("active") }
    deactivate() { this.field.removeClass("active") }
}


class CW { // Choice Wheel

    constructor(base, choices) {
        this.#calculateSizes(base);
        this.#generateBody(base);
        this.#generateNegativeMask();
        this.#placePlaceholder();
        this.#generateGradient("-inactive");
        this.#generateGradient("");
        const keys = this.#shuffleKeys(choices);
        this.#appendSectors(keys, choices);
        this.#appendLastDivider();
    }
    
    #calculateSizes(base) {
        const baseSize = parseFloat(getComputedStyle(base).height);
        this.sizes = {};
        this.sizes.divW = baseSize / 5;
        this.sizes.inR = baseSize / 2 + this.sizes.divW * 2;
        this.sizes.outR = baseSize * 3;
    }
    
    #generateBody(base) {
        const bodyRect = document.body.getBoundingClientRect();
        this.body = new SVGE([this.sizes.outR * 2, this.sizes.outR + this.sizes.divW / 2], { id: "cho-wheel", fill: "url(#cho-wheel-grad)" });
        this.body.setAttribute("style",
            `bottom: calc(${getComputedStyle(base).bottom} + var(--cho-size) * 0.4);` +
            `left: ${bodyRect.width / 2 - this.sizes.outR};`
        );
    }
    
    #generateNegativeMask() {
        const negMask = new SVGNSE("mask", { id: `${this.body.mask.id}-neg`, parent: this.body.defs.el });
        const children = () => [...this.body.mask.children];
        AF.holdUntill(30, () => children().length, () => {
            children().forEach(child => {
                const use = new SVGUE(`#${child.getAttribute("id")}`, { parent: negMask.el });
                use.setAttribute("style", "filter: invert(1)");
            });
        });
    }
    
    #placePlaceholder() {
        const rect = new SVGRE(["100%", "100%"]);
        rect.setAttribute("mask", `url(#${this.body.mask.id}-neg)`);
        rect.setAttribute("fill", "url(#cho-wheel-grad-inactive)");
        this.body.el.insertBefore(rect.el, this.body.main.el);
    }
    
    #generateGradient(name) {
        const gradient = new SVGNSE("radialGradient", { id: `cho-wheel-grad${name}` });
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
    
    #appendSectors(keys, choices) {
        this.fields = keys.map((key, i, a) => {
            const cws = new CWS(key, choices[key], this.sizes, i, a);
            AF.holdUntill(30, () => cws.field != null, () => this.body.addToMask(cws.field.el));
            AF.holdUntill(30, () => cws.divider != null, () => cws.divider.appendTo(this.body));
            return cws;
        });
    }
    
    #appendLastDivider() {
        const d = CWS.prototype.calculateDividerData(Math.PI, this.sizes);
        new SVGPE(d, { cn: "cho-divider", parent: this.body });
    }
}


class CM { // Choice Menu

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
        if (!base) { return }
        this.wheel = new CW(base, this.choices); 
        AF.holdUntill(30, () => this.wheel.body != null, () => {
            this.wheel.body.appendTo(this.menu);
            this.text = document.createElement("pre");
            this.text.id = "cho-text";
            this.text.style.bottom = parseFloat(getComputedStyle(this.wheel.body.el).bottom) + this.wheel.sizes.outR + "px";
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
    
    show() {
        this.updateMenu();
        this.menu.className = this.menu.className.split(" ").filter(cn => cn !== "hidden").join(" ");
    }
    
    hide() {
        if (this.menu.className.includes("hidden")) { return }
        this.menu.className = this.menu.className ? "hidden " + this.menu.className : "hidden";
    }
}


class CH extends Initable { // Choice Handler
    
    static chosen = undefined;
    static setChoice(choices) {
        if (choices == null) {
            this.chosen = null;
        } else if (typeof(choices) != "object") {
            this.chosen = choices;
        } else {
            AF.holdUntill(30, () => !SB.bubblesActive, () => {
                this.chosen = undefined;
                this.cc.removeClass("hidden");
                this.cm = new CM(choices);
                this.cc.base.appendChild(this.cm.menu);
            });
        }
    }
    
    static init() {
        super.init(() => {
            this.cc = new CC();
            document.body.appendChild(this.cc.base);
            
            this.cc.chip.addEventListener("pointerdown", e => {
                if (this.chosen !== undefined && !SB.bubblesActive || this.cc.chip.className.includes("hidden")) { return } // переделать в методы класса и вызывать в DH -> PM -> init
                e.preventDefault();
                const chipStyle = getComputedStyle(this.cc.chip);
                const x = parseFloat(chipStyle.left);
                const y = parseFloat(chipStyle.top);
                this.cc.dp = { x: e.screenX - x, y: e.screenY - y }
                this.cc.addClass("active");
                this.cm.show();
            }, true);
            
            document.body.addEventListener("pointermove", e => {
                if (!this.cc.active) { return }
                e.preventDefault();
                this.cc.chip.style.left = e.screenX - this.cc.dp.x + "px";
                this.cc.chip.style.top = e.screenY - this.cc.dp.y + "px";
                this.cc.updateChain();
                const field = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                const id = field != null ? parseInt(field.getAttribute("href").slice(3)) : undefined;
                AF.holdUntill(30, () => this.cm.wheel.fields != null, () => {
                    const cws = this.cm.wheel.fields[id];
                    Object.values(this.cm.wheel.fields).forEach(obj => obj.deactivate());
                    cws?.activate();
                    this.cm.text.textContent = cws?.text ?? "";
                    this.cc.setIcon(cws?.icon);
                    document.querySelector(":root").style.setProperty("--cur-color", cws?.color ?? "var(--m-color)");
                });
            });
            
            document.body.addEventListener("pointerup", e => {
                if (!this.cc.active) { return }
                e.preventDefault();
                this.cm.hide();
                this.cc.removeClass("active");
                this.cc.dp = null;
                const fired = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                if (fired != null) {
                    const id = parseInt(fired.getAttribute("href").slice(3));
                    const cws = this.cm.wheel.fields[id];
                    this.chosen = cws.value;
                }
                else { this.cc.retrieve() }
                AF.delay(.4, () => {
                    this.cc.retrieve();
                    this.cc.setIcon(undefined);
                    document.querySelector(":root").style.setProperty("--cur-color", "var(--m-color)");
                    if (this.chosen !== undefined) {
                        this.cc.addClass("hidden");
                        this.cm.menu.remove();
                        this.chosen = undefined;
                    }
                });
            });
            
        });
    }
}


CH.init();
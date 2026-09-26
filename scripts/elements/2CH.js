/* Choice Handler */

class CC { // Choice Chip
    constructor() {
        this.dp = null;
        
        this.base = document.createElement("div");
        this.base.id = "choice";
        this.base.className = "hidden";
        
        this.chip = document.createElement("div");
        this.chip.id = "chip";
        this.chip.textContent = "...";
        this.base.appendChild(this.chip);
        
        this.chipBorder = new SVGE([14], { cn: "chip-border" });
        this.chipBorder.appendTo(this.chip);
        
        const chipBorderPath = new SVGCE([6, 7]);
        chipBorderPath.appendTo(this.chipBorder.el);
    }
    
    get active() { return this.dp != null }
    
    addClass(className) {
        if (this.base.className.includes(className)) { return }
        this.base.className = this.base.className.split(" ").filter(cn => cn).concat([className]).join(" ");
    }
    
    removeClass(className) {
        this.base.className = this.base.className.split(" ").filter(cn => cn && cn !== className).join(" ");
    }
    
    blinkIcon(func) {
        this.icon?.setAttribute("class", "hidden chip-icon");
        this.chip.style.color = "transparent";  
        AH.delay(.4, () => {
            if (func) { func() }
           this.icon?.setAttribute("class", "chip-icon");
           this.chip.style.color = "";
        });
    }
    
    setIcon(icon) {
        console.log(icon, this.icon)
        if (icon !== this.icon?.outerHTML) {
            this.blinkIcon(() => {
                if (icon != null) {
                    this.chip.textContent = "";
                    this.icon = new DOMParser().parseFromString(icon, "image/svg+xml").querySelector("svg");
                } else {
                    this.icon?.setAttribute("class", "chip-icon hidden");
                    AH.delay(.4, () => {
                        this.icon?.remove();
                        this.icon = undefined;
                        this.chip.textContent = "...";
                        this.chip.style.color = "";
                    });
                }
            });
            this.lastIcon = icon;
        }
    }
    
    retrieve() {
        const style = () => getComputedStyle(this.chip);
        const a = () => parseFloat(style().left);
        const b = () => parseFloat(style().top);
        const rad = () => Math.atan2(b(), a());
        const direction = () => [Math.cos(rad()), Math.sin(rad())];
        AH.repeatUntill(1/60, () => !a() && !b(), () => {
            const c = Math.sqrt(a()**2 + b()**2);
            const [x, y] = [a(), b()].map((v, i) => v - direction()[i] * c / 10);
            this.chip.style.left = Math.abs(x) < .5 ? 0 : x + "px";
            this.chip.style.top = Math.abs(y) < .5 ? 0 : y + "px";
        });
    }
}


class CWS { // Choice Wheel Sector

    constructor(key, value, sizes, i, a) {
        this.text = key;
        this.#calculateColor(key);
        this.#fetchIcon(value);
        this.#generateSector(value, sizes, i, a);
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
        this.iconName = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 13.5 14 8A1 1 0 0 0 8 4 1 1 0 0 0 2 8z" fill="currentColor" /></svg>`;
    }
    
    async #generateSector(value, sizes, i, a) {
        const directions = this.#generateDirections(i, a, 180 / 5 / a.length);
        const cords = this.#calculateCords(directions, sizes);
        const fieldD = this.#gatherFieldData(cords);
        this.field = new SVGPE(fieldD, { id: value, cn: "cho-field" });
        const dividerD = this.#calculateDividerData(directions[0], sizes);
        this.divider = new SVGPE(dividerD, { cn: "cho-divider" });
    }
    
    #generateDirections(i, a, segments) {
        return [...Array(segments + 1)].map((_, seg) => seg / segments)
        .map(part => Math.PI * (i + part) / a.length);
    }
    
    #calculateCords(directions, sizes) {
        return directions.map(dir => DECC.cords(dir, sizes.outR, sizes.outR))
        .concat(directions.toReversed().map(dir => DECC.cords(dir, sizes.inR, sizes.outR)));
    }
    
    #gatherFieldData(cords) {
        return cords.map((pair, i) => (i ? "L" :"M") + pair.join(" ")).join("") + "z"
    }
    
    #calculateDividerData(dir, sizes) {
        const [xI, yI] = DECC.cords(dir, sizes.inR + sizes.divW * .5, sizes.outR);
        const [xO, yO] = DECC.cords(dir, sizes.outR - sizes.divW * .5, sizes.outR);
        return `M${xI} ${yI}L${xO} ${yO}`;
    }
    
    activate() { this.field.addClass("active") }
    
    deactivate() { this.field.removeClass("active") }
}


class CW { // Choice Wheel

    constructor(base, choices) {
        const keys = this.#shuffleKeys(choices);
        this.#calculateSizes(base);
        this.#generateBody(base);
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
    
    #shuffleKeys(choices) {
        return Object.keys(choices).reduce((arr, key) => {
            arr.splice((arr.length + 1) * Math.random(), 0, key);
            return arr;
        }, []);
    }
    
    #generateBody(base) {
        const bodyRect = document.body.getBoundingClientRect();
        this.body = new SVGE([this.sizes.outR * 2, this.sizes.outR + this.sizes.divW / 2], { id: "cho-wheel" });
        this.body.setAttribute("style",
            `bottom: calc(${getComputedStyle(base).bottom} + var(--cho-size) * 0.4);` +
            `left: ${bodyRect.width / 2 - this.sizes.outR};`
        );
    }
    
    async #appendSectors(keys, choices) {
        this.fields = Object.fromEntries(keys.map((key, i, a) => {
            const value = JSON.stringify([choices[key]]);
            const cws = new CWS(key, value, this.sizes, i, a);
            AH.holdUntill(30, () => cws.field != null, () => cws.field.appendTo(this.body));
            AH.holdUntill(30, () => cws.divider != null, () => cws.divider.appendTo(this.body));
            return [value, cws];
        }));
    }
    
    async #appendLastDivider() {
        const [xI, yI] = DECC.cords(Math.PI, this.sizes.inR + this.sizes.divW * .5, this.sizes.outR);
        const [xO, yO] = DECC.cords(Math.PI, this.sizes.outR - this.sizes.divW * .5, this.sizes.outR);
        const lastDivider = new SVGPE(`M${xI} ${yI}L${xO} ${yO}`, { cn: "cho-divider" });
        lastDivider.appendTo(this.body);
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
        AH.holdUntill(30, () => this.wheel.body != null, () => this.wheel.body.appendTo(this.menu));
        
        this.text = document.createElement("pre");
        this.text.id = "cho-text";
        this.text.style.bottom = parseFloat(getComputedStyle(this.wheel.body.el).bottom) + this.wheel.sizes.outR + "px";
        this.menu.appendChild(this.text);
    }
    
    blinkText(func) {
        this.text.className = "hidden cho-text";
        AH.delay(.4, () => {
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
            AH.holdUntill(30, () => !SB.bubblesActive, () => {
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
                if (this.chosen !== undefined && !SB.bubblesActive) { return }
                e.preventDefault();
                this.cc.dp = { x: e.screenX, y: e.screenY }
                this.cc.addClass("active");
                this.cm.show();
            }, true);
            
            document.body.addEventListener("pointermove", e => {
                if (!this.cc.active) { return }
                e.preventDefault();
                this.cc.chip.style.left = e.screenX - this.cc.dp.x + "px";
                this.cc.chip.style.top = e.screenY - this.cc.dp.y + "px";
                const field = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                AH.holdUntill(30, () => this.cm.wheel.fields != null, () => {
                    const cws = this.cm.wheel.fields[field?.id];
                    Object.values(this.cm.wheel.fields).forEach(obj => obj.deactivate());
                    cws?.activate();
                    this.cm.text.textContent = cws?.text ?? "";
                    this.cc.setIcon(cws?.iconName);
                    document.querySelector(":root").style.setProperty("--cur-color", cws?.color ?? "var(--m-color)");
                });
            });
            
            document.body.addEventListener("pointerup", e => {
                if (!this.cc.active) { return }
                e.preventDefault();
                this.cm.hide();
                this.cc.removeClass("active");
                this.cc.dp = null;
                const rect = this.cc.base.getBoundingClientRect();
                const id = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"))?.id;
                if (id === "[null]") { this.chosen = null }
                else if (id != null) { [this.chosen] = JSON.parse(id) }
                else { this.cc.retrieve() }
                AH.delay(.4, () => {
                    this.cc.retrieve();
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
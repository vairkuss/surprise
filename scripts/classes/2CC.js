class CF {
    constructor(text, value, path) {
        this.text = text;
        
        this.field = path;
        this.field.setAttribute("id", value);
        this.color = "#cafeba"; // generate from hexdump of text in big endian
        
        this.icon = document.createElement("div"); // fetch bla bla bla
        this.icon.className = "load-svg icon";
        this.icon.setAttribute("icon", "arrow");
    }
    
    activate() {
        if (this.field.className.includes("active")) { return }
        const className = this.field.getAttribute("class");
        this.field.setAttribute("class", "active " + (className ?? "\b"));
    }
    
    deactivate() {
        const className = this.field.getAttribute("class");
        this.field.setAttribute("class", className?.split(" ").filter(cn => cn !== "active").join(" ") ?? "");
    }
}


class CM {
    constructor(choices, setter) {
        this.menu = document.createElement("div");
        this.menu.id = "cho-menu";
        
        const textEl = document.createElement("pre");
        textEl.id = "cho-text";
        this.menu.appendChild(textEl);
        
        const baseSize = parseFloat(getComputedStyle(CC.base).height);
        const sepW = baseSize / 5;
        const inR = baseSize / 2 + sepW;
        const outR = baseSize * 2;
        const xmlns = "http://www.w3.org/2000/svg";
        console.debug();
        
        this.wheel = document.createElementNS(xmlns, "svg");
        this.wheel.setAttribute("xmlns", xmlns);
        this.wheel.setAttribute("id", "cho-wheel");
        this.wheel.setAttribute("width", outR * 2);
        this.wheel.setAttribute("height", outR);
        this.menu.appendChild(this.wheel);
        
        this.fields = Object.fromEntries(Object.keys(choices).map((key, i, a) => {
            const path = document.createElementNS(xmlns, "path");
            const rad0 = Math.PI * i / a.length;
            const rad1 = Math.PI * (i + 1) / a.length;
            const direction = dir => [-Math.cos(dir), Math.sin(dir)];
            const cords = (dir, l)  => direction(dir).map(v => v * l);
            const [ox0, oy0] = cords(rad0, outR);
            const [ox1, oy1] = cords(rad1, outR);
            const [ix1, iy1] = cords(rad1, inR);
            const [ix0, iy0] = cords(rad0, inR);
            path.setAttribute("d", `M${ox0} ${oy0}L${ox1} ${oy1}L${ix1} ${iy1}L${ix0}${iy0}z`);
        
            const cf = new CF(key, "" + choices[key], path);
            this.wheel.appendChild(cf.field);
            return ["" + choices[key], cf];
        }));
        
        this.hide();
        CC.base.appendChild(this.menu);
    }
    
    show() {
        this.menu.className = this.menu.className.split(" ").filter(cn => cn !== "hidden").join(" ");
    }
    
    hide() {
        if (this.menu.className.includes("hidden")) { return }
        this.menu.className = this.menu.className ? "hidden " + this.menu.className : "hidden";
    }
}


class CC extends Initable {
    
    static dp = null;
    static get active() {
        return this.dp != null;
    }
    static base = document.querySelector("#choice");
    static chip = this.base.firstElementChild;
    
    static retrieve() {
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
    
    static chosen = undefined;
    
    static setChoice(choices) {
        if (choices == null) {
            SB.hit();
            this.chosen = null;
        } else if (typeof(choices) != "object") {
            this.chosen = choices;
        } else {
            this.chosen = undefined;
            this.base.style.top = "15vh";
            this.cm = new CM(choices, value => this.chosen = value);
        }
    }
    
    static init() {
        super.init(() => {
            this.chip.addEventListener("pointerdown", e => {
                e.preventDefault();
                const rect = this.chip.getBoundingClientRect();
                this.dp = { x: e.screenX, y: e.screenY }
                this.cm.show();
            }, true);
            document.body.addEventListener("pointermove", e => {
                if (this.active) {
                    e.preventDefault();
                    this.chip.style.left = e.screenX - this.dp.x + "px";
                    this.chip.style.top = e.screenY - this.dp.y + "px";
                    const rect = this.base.getBoundingClientRect();
                    const field = document.elementsFromPoint(e.screenX, e.screenY - rect.top).find(el => el.matches(".cho-field"));
                    const cf = this.cm.fields[field?.id];
                    cf?.activate();
                    Object.values(this.cm.fields).filter(x => x !== cf).forEach(x => x.deactivate());
                }
            });
            document.body.addEventListener("pointerup", e => {
                if (this.active) {
                    e.preventDefault();
                    this.cm.hide();
                    this.dp = null;
                    this.retrieve();
                    const rect = this.base.getBoundingClientRect();
                    const id = document.elementsFromPoint(e.screenX, e.screenY - rect.top).find(el => el.matches(".cho-field"))?.id;
                    AH.delay(.4, () => {
                        if (id === "null") { this.chosen = null }
                        else if (id != null) { this.chosen = parseInt(id) }
                        if (this.chosen !== undefined) {
                            this.base.style.top = "calc(-2 * var(--cho-size))";
                            this.cm.menu.remove();
                        }
                    });
                }
            });
        });
    }
}


CC.init();
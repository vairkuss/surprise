/* Choice Handler */

class CF {
    constructor(text, path) {
        this.text = text;
        this.field = path;
        
        this.color = "#000";
        const bytes = new TextEncoder().encode(text);
        crypto.subtle.digest("SHA-256", bytes).then(hash => {
            this.color = "#" + new Uint8Array(hash.slice(0, 3)).toHex();
        });
        
        this.icon = document.createElement("div");
        this.icon.className = "load-svg icon";
        this.icon.setAttribute("icon", "arrow"); // if not < 0 or null fetch unique random icon bla bla bla else patpat or end dialogue
    }
    
    activate() {
        const className = this.field.getAttribute("class");
        if (className.includes("active")) { return }
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
        
        this.choices = choices;
        
        this.hide();
        CC.base.appendChild(this.menu); // нарушение солид
    }
        
    updateWheel() {
        this.wheel?.remove();
        this.text?.remove();
        
        const baseSize = parseFloat(getComputedStyle(CC.base).height); // нарушение солид
        const baseRect = CC.base.getBoundingClientRect(); // нарушение солид
        const divW = baseSize / 5;
        const inR = baseSize / 2 + divW * 2;
        const outR = baseSize * 3;
        const xmlns = "http://www.w3.org/2000/svg";
        
        this.wheel = document.createElementNS(xmlns, "svg");
        this.wheel.setAttribute("xmlns", xmlns);
        this.wheel.setAttribute("id", "cho-wheel");
        this.wheel.setAttribute("width", outR * 2);
        this.wheel.setAttribute("height", outR + divW / 2);
        this.wheel.setAttribute("style",
            `bottom: calc(${getComputedStyle(CC.base).bottom} + var(--cho-size) * 0.4);` +
            `left: ${baseRect.left + baseRect.width / 2 - outR};`
        );
        this.menu.appendChild(this.wheel);
        
        const direction = rad => [Math.cos(rad), -Math.sin(rad)];
        const cords = (dir, l) => direction(dir).map((v, i) => v * l + outR);
        
        this.fields = Object.fromEntries(Object.keys(this.choices)
        .reduce((arr, key) => {
            arr.splice((arr.length + 1) * Math.random(), 0, key);
            return arr;
        }, [])
        .map((key, i, a) => {
            const path = document.createElementNS(xmlns, "path");
            path.setAttribute("class", "cho-field");
            path.setAttribute("id", JSON.stringify([this.choices[key]]));
            
            const rad0 = Math.PI * i / a.length;
            const rad1 = Math.PI * (i + 1) / a.length;
            const radF = Math.PI * (i + .5) / a.length;

            const [ox0, oy0] = cords(rad0, outR);
            const [oxF, oyF] = cords(radF, outR);
            const [ox1, oy1] = cords(rad1, outR);
            const [ix1, iy1] = cords(rad1, inR);
            const [ixF, iyF] = cords(radF, inR);
            const [ix0, iy0] = cords(rad0, inR);
            
            path.setAttribute("d",
                `M${ox0} ${oy0}` +
                `L${oxF} ${oyF}` +
                `L${ox1} ${oy1}` +
                `L${ix1} ${iy1}` +
                `L${ixF} ${iyF}` +
                `L${ix0} ${iy0}` +
                `z`
            );
            
            const divider = document.createElementNS(xmlns, "path");
            divider.setAttribute("class", "cho-divider");
            const [xI, yI] = cords(rad0, inR + divW * .5);
            const [xO, yO] = cords(rad0, outR - divW * .5);
            divider.setAttribute("d",
                `M${xI} ${yI}` +
                `L${xO} ${yO}`
            );
            this.wheel.appendChild(divider);
        
            const cf = new CF(key, path);
            this.wheel.appendChild(path);
            return [JSON.stringify([this.choices[key]]), cf];
        }));
        
        const lastDivider = document.createElementNS(xmlns, "path");
        lastDivider.setAttribute("class", "cho-divider");
        const [xI, yI] = cords(Math.PI, inR + divW * .5);
        const [xO, yO] = cords(Math.PI, outR - divW * .5);
        lastDivider.setAttribute("d",
            `M${xI} ${yI}` +
            `L${xO} ${yO}`
        );
        this.wheel.appendChild(lastDivider);
        
        this.text = document.createElement("pre");
        this.text.id = "cho-text";
        this.text.style.bottom = parseFloat(getComputedStyle(this.wheel).bottom) + outR + "px";
        this.menu.appendChild(this.text);
    }
    
    show() {
        this.updateWheel();
        this.menu.className = this.menu.className.split(" ").filter(cn => cn !== "hidden").join(" ");
    }
    
    hide() {
        if (this.menu.className.includes("hidden")) { return }
        this.menu.className = this.menu.className ? "hidden " + this.menu.className : "hidden";
    }
}


class CC extends Initable {
    
    static dp = null;
    static get active() { return this.dp != null }
    
    static base = document.querySelector("#choice");
    static chip = this.base.firstElementChild;
    
    static removeClass(className) {
        this.base.className = this.base.className.split(" ").filter(cn => cn !== className).join(" ");
    }
    
    static addClass(className) {
        if (this.base.className.includes(className)) { return }
        this.base.className = this.base.className ? className + " " + this.base.className : className;
    }
    
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
    
    // разрыв тут
    
    static chosen = undefined;
    static setChoice(choices) {  // нарушение солид, сделай CH
        if (choices == null) {
            SB.hit(); // нарушение солид, делай это на высшем уровне
            this.chosen = null;
        } else if (typeof(choices) != "object") {
            this.chosen = choices;
        } else {
            this.chosen = undefined;
            this.removeClass("hidden");
            this.cm = new CM(choices, value => this.chosen = value);
        }
    }
    
    static init() {
        super.init(() => {
            
            this.chip.addEventListener("pointerdown", e => {
                e.preventDefault();
                this.dp = { x: e.screenX, y: e.screenY }
                this.addClass("active");
                this.cm.show();
            }, true);
            
            document.body.addEventListener("pointermove", e => {
                if (this.active) {
                    e.preventDefault();
                    this.chip.style.left = e.screenX - this.dp.x + "px";
                    this.chip.style.top = e.screenY - this.dp.y + "px";
                    const field = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
                    const cf = this.cm.fields[field?.id];
                    Object.values(this.cm.fields).forEach(obj => obj.deactivate());
                    cf?.activate();
                    this.cm.text.textContent = cf?.text ?? "";
                    document.querySelector(":root").style.setProperty("--cur-color", cf?.color ?? "var(--m-color)");
                }
            });
            
            const chipBias = parseFloat(getComputedStyle(this.base).height);
            document.body.addEventListener("pointerup", e => {
                if (this.active) {
                    e.preventDefault();
                    this.cm.hide();
                    this.removeClass("active");
                    this.dp = null;
                    const rect = this.base.getBoundingClientRect();
                    const id = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"))?.id;
                    if (id === "[null]") { this.chosen = null }
                    else if (id != null) { [this.chosen] = JSON.parse(id); console.log(this.chosen) }
                    else { this.retrieve() }
                    AH.delay(.4, () => {
                        this.retrieve()
                        document.querySelector(":root").style.setProperty("--cur-color", "var(--m-color)");
                        if (this.chosen !== undefined) {
                            this.addClass("hidden");
                            this.cm.menu.remove();
                        }
                    });
                }
            });
            
        });
    }
}


CC.init();
/**
class CT {
    static addClass(element, newClassName) {
        const className = element.getAttribute("class");
        if (className.includes(newClassName)) { return }
        element.setAttribute("class", `${newClassName} ` + (className ?? "\b"));
    }
    
    static removeClass(element, newClassName) {
        const className = element.getAttribute("class");
        element.setAttribute("class", className?.split(" ").filter(cn => cn !== "active").join(" ") ?? "");
    }
}


class MSSH extends CT {
    static show(element, callback) {
        super.addClass(element, "hidden");
    }
    
    static hide(element, callback) {
        super.removeClass(element, "hidden");
    }
}


class MOSH extends CT {
    show(element, callback) {
        CT.addClass(element, "hidden");
    }
    
    hide() {
        CT.removeClass(element, "hidden");
    }
}


class MSAD extends CT {
    static activate() {
        super.addClass(element, "active");
    }
    
    static deactivate() {
        super.removeClass(element, "active");
    }
}


class MOAD extends CT {
    activate() {
        CT.addClass(element, "active");
    }
    
    deactivate() {
        CT.removeClass(element, "active");
    }
}
//////// MIXINS ARE GOING TO THEIR OWN FILE IN THE FUTURE
//*/

class CF {
    constructor(text, value, path) {
        this.text = text;
        path.setAttribute("id", value);
        this.field = path;
        this.color = "#cafeba"; // generate from hexdump of text in big endian
        
        this.icon = document.createElement("div");
        this.icon.className = "load-svg icon";
        this.icon.setAttribute("icon", "arrow"); // if not < 0 or null fetch unique random icon bla bla bla else patpat or end dialogue
    }
    
    activate() {
        CC.cm.text.textContent = this.text;
        const className = this.field.getAttribute("class");
        if (className.includes("active")) { return }
        this.field.setAttribute("class", "active " + (className ?? "\b"));
    }
    
    deactivate() {
        CC.cm.text.textContent = "";
        const className = this.field.getAttribute("class");
        this.field.setAttribute("class", className?.split(" ").filter(cn => cn !== "active").join(" ") ?? "");
    }
}


class CM {
    constructor(choices, setter) {
        this.menu = document.createElement("div");
        this.menu.id = "cho-menu";
        
        this.text = document.createElement("pre");
        this.text.id = "cho-text";
        this.menu.appendChild(this.text);
        
        this.choices = choices;
        this.updateWheel();
        
        this.hide();
        CC.base.appendChild(this.menu);
    }
        
    updateWheel() {
        this.wheel?.remove();
        
        const baseSize = parseFloat(getComputedStyle(CC.base).height);
        const baseRect = CC.base.getBoundingClientRect();
        const sepW = baseSize / 3;
        const inR = baseSize / 2;
        const outR = baseSize * 2 + sepW;
        const docW = document.body.getBoundingClientRect().width;
        const xmlns = "http://www.w3.org/2000/svg";
        
        this.wheel = document.createElementNS(xmlns, "svg");
        this.wheel.setAttribute("xmlns", xmlns);
        this.wheel.setAttribute("id", "cho-wheel");
        this.wheel.setAttribute("width", (outR + sepW) * 2);
        this.wheel.setAttribute("height", outR + sepW);
        this.wheel.setAttribute("style",
            `top: ${baseRect.top + baseRect.height / 2 - outR - sepW};` +
            `left: ${baseRect.left + baseRect.width / 2 - outR - sepW};`
        );
        this.menu.appendChild(this.wheel);
        
        this.fields = Object.fromEntries(Object.keys(this.choices).map((key, i, a) => {
            const path = document.createElementNS(xmlns, "path");
            path.setAttribute("class", "cho-field");
            
            const rad0 = Math.PI * i / a.length;
            const rad1 = Math.PI * (i + 1) / a.length;
            const radF = Math.PI * (i + .5) / a.length;
            
            const direction = rad => [Math.cos(rad), -Math.sin(rad)];
            const bias = direction(radF).map(v => v * sepW);
            
            const cords = (dir, l) => direction(dir).map((v, i) => v * l + bias[i] + outR + (i ? sepW : sepW));
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
        
            const cf = new CF(key, "" + this.choices[key], path);
            this.wheel.appendChild(cf.field);
            return ["" + this.choices[key], cf];
        }));
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
    static get active() {
        return this.dp != null;
    }
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
    
    static chosen = undefined;
    
    static setChoice(choices) {
        if (choices == null) {
            SB.hit();
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
                //const rect = this.chip.getBoundingClientRect();
                this.dp = { x: e.screenX, y: e.screenY }
                this.addClass("active");
                this.cm.show();
            }, true);
            document.body.addEventListener("pointermove", e => {
                if (this.active) {
                    e.preventDefault();
                    this.chip.style.left = e.screenX - this.dp.x + "px";
                    this.chip.style.top = e.screenY - this.dp.y + "px";
                    const rect = this.base.getBoundingClientRect();
                    const field = document.elementsFromPoint(e.screenX, e.screenY - rect.height).find(el => el.matches(".cho-field"));
                    const cf = this.cm.fields[field?.id];
                    Object.values(this.cm.fields).filter(x => x !== cf).forEach(x => x.deactivate());
                    cf?.activate();
                    console.log(cf?.field.getAttribute("class"))
                }
            });
            document.body.addEventListener("pointerup", e => {
                if (this.active) {
                    e.preventDefault();
                    this.cm.hide();
                    this.removeClass("active");
                    this.dp = null;
                    this.retrieve();
                    const rect = this.base.getBoundingClientRect();
                    const id = document.elementsFromPoint(e.screenX, e.screenY - rect.height).find(el => el.matches(".cho-field"))?.id;
                    AH.delay(.4, () => {
                        if (id === "null") { this.chosen = null }
                        else if (id != null) { this.chosen = parseInt(id) }
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
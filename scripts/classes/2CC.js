class CF {
    constructor(text, value) {
        this.field = document.createElement("div");
        this.field.className = "cho-field";
        this.field.textContent = text;
        this.field.id = value;
    }
    
    activate() {
        if (this.field.className.includes("active")) { return }
        this.field.className = "active " + this.field.className;
    }
    
    deactivate() {
        this.field.className = this.field.className.split(" ").filter(cn => cn !== "active").join(" ");
    }
}


class CM {
    constructor(choices, setter) {
        this.menu = document.createElement("div");
        this.menu.id = "cho-menu";
        this.fields = Object.fromEntries(Object.keys(choices).map(key => {
            const cf = new CF(key, "" + choices[key]);
            this.menu.appendChild(cf.field);
            return ["" + choices[key], cf];
        }));
        this.hide();
        document.body.querySelector("#choice").appendChild(this.menu);
    }
    
    show() {
        this.menu.className = this.menu.className.split(" ").filter(cn => cn !== "hidden").join(" ");
    }
    
    hide() {
        if (this.menu.className.includes("hidden")) { return }
        this.menu.className = "hidden " + this.menu.className;
    }
}


class CC extends Initable {
    
    static dp = null;
    static get active() {
        return this.dp != null;
    }
    static body = document.querySelector("#choice");
    static chip = this.body.firstElementChild;
    
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
            this.body.style.top = "15vh";
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
                    const rect = this.body.getBoundingClientRect();
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
                    const rect = this.body.getBoundingClientRect();
                    const id = document.elementsFromPoint(e.screenX, e.screenY - rect.top).find(el => el.matches(".cho-field"))?.id;
                    AH.delay(.4, () => {
                        if (id === "null") { this.chosen = null }
                        else if (id != null) { this.chosen = parseInt(id) }
                        if (this.chosen !== undefined) {
                            this.body.style.top = "calc(-2 * var(--cho-size))";
                            this.cm.menu.remove();
                        }
                    });
                }
            });
        });
    }
}


CC.init();
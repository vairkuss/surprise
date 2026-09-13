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
        }, () => console.log("true end"));
    }
    
    static choice = null;
    static setChoice(choice) {
        this.body.style.top = "15vh";
        this.choice = choice;
    }
    
    static startChoosing() {
        
    }
    
    static init() {
        super.init(() => {
            this.chip.addEventListener("pointerdown", e => {
                e.preventDefault();
                const rect = this.chip.getBoundingClientRect();
                this.dp = { x: e.screenX, y: e.screenY }
            }, true);
            document.body.addEventListener("pointermove", e => {
                if (this.active) {
                    e.preventDefault();
                    this.chip.style.left = e.screenX - this.dp.x + "px";
                    this.chip.style.top = e.screenY - this.dp.y + "px";
                }
            });
            document.body.addEventListener("pointerup", e => {
                if (this.active) {
                    e.preventDefault();
                    this.dp = null;
                    this.retrieve();
                }
            });
        });
    }
}


CC.init();
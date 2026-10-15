/* Choice Handler */

import AF from "./AF.mjs";
import CC from "./CC.mjs";
import CM from "./CM.mjs";


export default class CH { // Choice Handler
    
    static cc = new CC();
    static chosen = undefined;
    
    static setChoice(choices) {
        if (choices == null) {
            this.chosen = null;
        } else if (typeof choices !== "object" || choices.constructor.name === "Array") {
            this.chosen = choices;
        } else {
            SB.onWritingEnd(() => {
                this.chosen = undefined;
                this.cc.classList.remove("hidden");
                this.cm = new CM(choices);
                this.cc.base.appendChild(this.cm.menu);
            });
        }
    }
    
    static dragChip(event) {
        if (!this.cc.active) return;
        event.preventDefault();
        this.cc.chip.style.left = e.screenX - this.cc.dp.x + "px";
        this.cc.chip.style.top = e.screenY - this.cc.dp.y + "px";
        this.cc.updateChain();
        const fired = document.elementsFromPoint(e.clientX, e.clientY);
        const field = fired.find(el => el.matches(".cho-field"));
        const id = field == null ? field : parseInt(field.getAttribute("href").slice(3));
        const cs = this.cm.wheel.fields[id];
        this.cm.wheel.fields.forEach(obj => obj.deactivate());
        if (cs != null) {
            cs.activate();
            this.cm.text.textContent = cs.text;
            cs.whenReady(() => {
                this.cc.setIcon(cs.icon);
                root.style.setProperty("--cur-color", cs.color);
            });
        } else root.style.setProperty("--cur-color", "var(--m-color)");
    }
    
    static makeChoice(event) {
        if (!this.cc.active) return;
        event.preventDefault();
        this.cm.hide();
        this.cc.removeClass("active");
        this.cc.dp = null;
        const fired = document.elementsFromPoint(e.clientX, e.clientY);
        const field = fired.find(el => el.matches(".cho-field"));
        if (field != null) {
            const id = parseInt(field.getAttribute("href").slice(3));
            const cs = this.cm.wheel.sectors[id];
            this.chosen = cs.value;
        } else if (this.chosen !== undefined) {
            setTimeout(() => {
                this.cc.retrieve();
                this.cc.setIcon(undefined);
                this.chosen = undefined;
                this.cm.menu.remove();
                this.cc.base.classList.add("hidden");
                root.style.setProperty("--cur-color", "var(--m-color)");
            }, 400);
        } else this.cc.retrieve();
    }
}

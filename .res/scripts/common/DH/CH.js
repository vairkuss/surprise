/* Choice Handler */

import { AF } from "AF.js";
import { CC } from "CC.js";
import { CM } from "CM.js";


class CH { // Choice Handler
    
    static cc = new CC();
    static chosen = undefined;
    
    static setChoice(choices) {
        if (choices == null) {
            this.chosen = null;
        } else if (typeof choices !== "object" || choices.constructor.name === "Array") {
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
    
    static dragChip(event) {
        if (!this.cc.active) return;
        event.preventDefault();
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
    }
    
    static makeChoice(event) {
        if (!this.cc.active) return;
        event.preventDefault();
        this.cm.hide();
        this.cc.removeClass("active");
        this.cc.dp = null;
        const fired = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.matches(".cho-field"));
        if (fired != null) {
            const id = parseInt(fired.getAttribute("href").slice(3));
            const cws = this.cm.wheel.fields[id];
            this.chosen = cws.value;
        } else if (this.chosen !== undefined) {
            AF.delay(.4, () => {
                this.cc.retrieve();
                this.cc.setIcon(undefined);
                this.chosen = undefined;
                this.cm.menu.remove();
                this.cc.addClass("hidden");
                document.querySelector(":root").style.setProperty("--cur-color", "var(--m-color)");
            });
        } else this.cc.retrieve();
    }
}

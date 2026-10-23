/* Choice Handler */

import CC from "./CC.mjs";
import CM from "./CM.mjs";
import SB from "./SB.mjs";


export default class CH { // Choice Handler
    
    static cc = new CC();
    
    static setChoice(choice) {
        if (choice?.constructor.name === "Object") {
            this.cc.base.classList.remove("hidden");
            this.cm = new CM(choice);
            this.cc.base.appendChild(this.cm.menu);
        } else {
            const detail = choice ?? null;
            const chosen = new CustomEvent("chChosen", { detail });
            signal.dispatchEvent(chosen);
        }
    }
    
    static dragChip(e) {
        if (!this.cc.active) return;
        e.preventDefault();
        this.cc.chip.style.left = e.clientX - this.cc.dp.x + "px";
        this.cc.chip.style.top = e.clientY - this.cc.dp.y + "px";
        this.cc.updateChain();
        const fired = document.elementsFromPoint(e.clientX, e.clientY);
        const field = fired.find(el => el.matches(".cho-field"));
        const href = field?.getAttribute("href");
        const id = parseInt(href?.slice(3));
        const cs = this.cm.wheel?.sectors[id];
        this.cm.wheel.sectors.forEach(sec => sec.deactivate());
        if (cs == null)  {
            root.style.setProperty("--cur-color", "var(--m-color)");
            return;
        }
        cs.activate();
        this.cm.text.textContent = cs.text;
        cs.onReady(() => {
            this.cc.setIcon(cs.icon);
            this.cm.blinkText();
            root.style.setProperty("--cur-color", cs.color);
        });
    }
    
    static makeChoice(e) {
        if (!this.cc.active) return;
        e.preventDefault();
        this.cm.hide();
        this.cc.base.classList.remove("active");
        this.cc.dp = null;
        const fired = document.elementsFromPoint(e.clientX, e.clientY);
        const field = fired.find(el => el.matches(".cho-field"));
        if (field != null) alert(field.getAttribute("href"));
        const digit = field?.getAttribute("href").slice(3);
        const id = Number.isNaN(digit) ? digit : parseInt(digit);
        const cs = this.cm.wheel.sectors[id];
        const detail = cs?.value;
        console.log({field, digit, id, cs, detail})
        if (detail === undefined) {
            return this.cc.retrieve();
        }
        setTimeout(() => {
            this.cc.retrieve();
            this.cc.setIcon();
            this.cm.menu.remove();
            this.cc.base.classList.add("hidden");
            root.style.setProperty("--cur-color", "var(--m-color)");
            const chosen = new CustomEvent("chChosen", { detail });
            signal.dispatchEvent(chosen);
        }, 0.4 * 1000);
    }
}

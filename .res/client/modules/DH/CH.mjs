/* Choice Handler */

import CC from "./CC.mjs";
import CM from "./CM.mjs";


export default class CH { // Choice Handler
    
    static cc = new CC();
    
    static setChoice(detail) {
        if (detail == null) {
            detail = null;
        } else if (detail.constructor.name === "Object") {
            signal.addEventListener("sbWritingEnd", () => {
                this.cc.classList.remove("hidden");
                this.cm = new CM(detail);
                this.cc.base.appendChild(this.cm.menu);
            }, { once: 1 });
        }
        if (detail !== undefined) {
            const event = new CustomEvent("chChosen", { detail });
            signal.dispatchEvent(event);
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
        const href = field.getAttribute("href");
        const id = parseInt(href.slice(3));
        const cs = this.cm.wheel.sectors[id];
        this.cm.wheel.sectors.forEach(f => f.deactivate());
        if (cs != null) {
            cs.activate();
            this.cm.text.textContent = cs.text;
            cs.onColorGenerated(() => {
                this.cc.setIcon(cs.icon);
                this.cm.blinkText();
                root.style.setProperty("--cur-color", cs.color);
            });
        } else {
            root.style.setProperty("--cur-color", "var(--m-color)");
        }
    }
    
    static makeChoice(event) {
        if (!this.cc.active) return;
        event.preventDefault();
        this.cm.hide();
        this.cc.base.classList.remove("active");
        this.cc.dp = null;
        const fired = document.elementsFromPoint(e.clientX, e.clientY);
        const field = fired.find(el => el.matches(".cho-field"));
        const href = field.getAttribute("href");
        const id = parseInt(href.slice(3));
        const cs = this.cm.wheel.sectors[id];
        const detail = cs?.value;
        if (detail !== undefined) {
            return setTimeout(() => {
                this.cc.retrieve();
                this.cc.setIcon();
                const event = new CustomEvent("chChosen", { detail });
                signal.dispatchEvent(event);
                this.cm.menu.remove();
                this.cc.base.classList.add("hidden");
                root.style.setProperty("--cur-color", "var(--m-color)");
            }, 400);
        }
        this.cc.retrieve();
    }
}

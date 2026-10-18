/* Page Finiliser */

import { VSE } from "./VE.mjs";


export default class PF { // Page Finiliser
    
    static #loadSVG() {
        const xmlns = "http://www.w3.org/2000/svg";
        document.querySelectorAll(".load-svg").forEach(icon => { 
            icon.classList.remove("load-svg");
            const text = [...icon.childNodes].find(child => {
                return child.nodeType === Node.TEXT_NODE;
            });
            const name = text?.nodeValue;
            const donor = window.data.icons.named[name];
            if (donor != null) {
                text.remove();
                new VSE([], { parse: donor, parent: icon, fill: "url(#text-grad)" });
            }
        });
    }
    
    static #adjustPosition() {
        document.querySelectorAll(".middle").forEach(el => {
            el.style.setProperty("--rx", `${el.offsetWidth / 2}px`);
            el.style.setProperty("--ry", `${el.offsetHeight / 2}px`);
        });
    }
    
    static #takeInsertPlace() {
        document.querySelectorAll(".vbox:has(> .insert)").forEach(el => {
            const h = [...el.children].reduce((margin, child) => {
                if (child.matches(".insert")) {
                    const rect = child.getBoundingClientRect();
                    return margin + rect.height;
                }
            }, 0);
            const placeholder = document.createElement("div");
            placeholder.className = "placeholder";
            placeholder.style.position = "relative";
            placeholder.style.width = "100%";
            placeholder.style.height = `${h}px`;
            el.appendChild(placeholder);
        });
    }
    
    static init() {
        this.#loadSVG();
        this.#adjustPosition();
        this.#takeInsertPlace();
        document.body.removeAttribute("style");
    }
}

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
    
    static #adjustBlocks() {
        document.querySelectorAll(".middle").forEach(block => {
            const { width, height } = block.getBoundingClientRect();
            block.style.setProperty("--rx", `${block.offsetWidth / 2}px`);
            block.style.setProperty("--ry", `${block.offsetHeight / 2}px`);
        });
    }
    
    static init() {
        this.#loadSVG();
        this.#adjustBlocks();
        document.body.removeAttribute("style");
    }
}

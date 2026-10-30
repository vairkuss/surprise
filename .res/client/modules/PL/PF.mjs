/* Page Finiliser */

import { VSE } from "./VE.mjs";


export default class PF { // Page Finiliser
    
    static #loadSVG() {
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
    
    static #startAdjusting() {
        window.addEventListener("resize", () => {
            document.querySelectorAll(".mid").forEach(el => {
                el.style.setProperty("--rx", `${el.offsetWidth / 2}px`);
                el.style.setProperty("--ry", `${el.offsetHeight / 2}px`);
            });
            
            const bodyRect = document.body.getBoundingClientRect();
            const { width, height } = bodyRect;
            const canvas = document.querySelector("#particles");
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
        });
        window.dispatchEvent(new Event("resize"));
    }
    
    static #assignBtnFuncs() {
        document.querySelectorAll("*[onclick]").forEach(btn => {
            const func = btn.getAttribute("onclick");
            btn.removeAttribute("onclick");
            btn.addEventListener("pointerdown", () => {
                if (btn.matches(".masked")) {
                    btn.classList.remove("masked");
                    btn.style.transform = "scale(1.2)";
                    setTimeout(() => {
                        btn.removeAttribute("style");
                    }, 200);
                } else {
                    const timeout = setTimeout(() => eval(func), 200);
                    sessionStorage.setItem("btnTimeout", `${timeout}`);
                }
            });
        });
        document.body.addEventListener("pointerup", () => {
            const timeout = sessionStorage.getItem("btnTimeout");
            clearTimeout(timeout);
        });
    }
    
    static init() {
        this.#loadSVG();
        this.#startAdjusting();
        this.#assignBtnFuncs();
        document.body.removeAttribute("style");
    }
}

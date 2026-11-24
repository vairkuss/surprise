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
            assignBtnFunc(btn, func);
            btn.removeAttribute("onclick");
        });
        document.body.addEventListener("pointerup", () => {
            const timeout = sessionStorage.getItem("btnTimeout");
            clearTimeout(timeout);
        });
    }
    
    static init() {
        this.#loadSVG();
        this.#startAdjusting();
        window.assignBtnFunc = (btn, func, once) => {
            const processStateChange = () => {
                if (btn.matches(".masked")) {
                    btn.classList.remove("masked");
                    btn.style.transform = "scale(1.2)";
                    setTimeout(() => {
                        btn.removeAttribute("style");
                    }, 400);
                    if (once) {
                        assignBtnFunc(btn, func, once);
                    }
                } else {
                    const timeout = setTimeout(() => {
                        if (typeof func === "function") {
                            func();
                        } else if (typeof func === "string") {
                            eval(func);
                        }
                    }, 200);
                    sessionStorage.setItem("btnTimeout", `${timeout}`);
                }
            }
            btn.addEventListener("pointerdown", processStateChange, { once });
        }
        this.#assignBtnFuncs();
        document.body.removeAttribute("style");
    }
}

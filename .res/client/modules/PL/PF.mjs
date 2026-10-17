/* Page Finiliser */


export default class PF { // Page Finiliser

    static #loadSVG() {
        document.querySelectorAll(".load-svg").forEach(icon => { 
            icon.classList.remove("load-svg");
            const text = [...icon.childNodes].find(child => child.nodeType === Node.TEXT_NODE);
            const name = text?.nodeValue;
            const svg = window.data.icons.named[name];
            if (svg != null) {
                text.remove();
                icon.appendChild(svg.cloneNode(true));
            }
        });
    }
    
    static #adjustBlocks() {
        document.querySelectorAll(".middle").forEach(block => {
            const style = getComputedStyle(block);
            const rect = block.getBoundingClientRect();
            const offset = {
                w: block.offsetWidth,
                h: block.offsetHeight
            };
            console.log({class:block.className,rect:{w:rect.width, h:rect.height},style:{w:style.width, h:style.height}, offset });
            const [w, h] = [style.width, style.height].map(v => {
                const conv = parseFloat(v);
                return conv === conv ? conv : 0;
            });
            block.style.setProperty("--rx", `${(w || h) / 2}px`);
            block.style.setProperty("--ry", `${(h || w) / 2}px`);
        });
    }
    
    static init() {
        this.#loadSVG();
        this.#adjustBlocks();
        document.body.removeAttribute("style");
    }
}

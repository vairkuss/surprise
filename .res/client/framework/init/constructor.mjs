/* Page Finiliser */


export default class PF { // Page Finiliser

    static #loadSVG() {
        document.querySelectorAll(".load-svg").forEach(icon => { 
            icon.classList.remove("load-svg");
            const name = icon.textContent;
            icon.textContent = '';
            const svg = window.data.icons.named[name];
            if (svg != null) icon.appendChild(svg);
        });
    }

    static #developBlocks(blocks) {
        if (blocks == null) {
            const lowest = ".block:not(:has(.block))";
            blocks = [...document.querySelectorAll(lowest)];
        }
        blocks = blocks.filter(block => block != null);
        if (!blocks.length) return;
        const ringless = ".block:not(:has(> .inner-ring))";
        blocks.forEach(block => {
            if (!block.matches(ringless)) return;
            const ring = document.createElement("div");
            ring.className = "inner-ring";
            ring.innerHTML = block.innerHTML;
            block.innerHTML = ring.outerHTML;
        });
        const parents = blocks.reduce((unique, block) => {
            const parent = block.closest(ringless);
            const parentNew = !unique.includes(parent);
            if (parentNew && parent != null) unique.push(parent);
            return unique;
        }, []);
        this.#developBlocks(parents);
    }
    
    static #adjustBlocks() {
        const middle = [...document.querySelectorAll(".middle")];
        middle.forEach(block => {
            const { width, height } = block.getBoundingClientRect();
            const ignoreX = block.matches(".right, .left");
            const ignoreY = block.matches(".top, .bottom");
            if (!ignoreX) block.style.setProperty("--rx", `${width}px`);
            if (!ignoreY) block.style.setProperty("--ry", `${height}px`);
        });
    }
    
    static init() {
        document.body.appendChild(window.data.grads);
        this.#loadSVG();
        this.#developBlocks();
        this.#adjustBlocks();
    }
}

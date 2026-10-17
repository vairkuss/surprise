/* INFILAXY */


class MainPage {
    
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
            [...block.childNodes].forEach(child => ring.appendChild(child));
            block.appendChild(ring);
        });
        const parents = [];
        blocks.forEach(block => {
            const parent = block.closest(ringless);
            if (!parents.includes(parent) && parent != null) {
                parents.push(parent);
            }
        });
        this.#developBlocks(parents);
    }
    
    static init() {
        this.#developBlocks();
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => MainPage.init());
} else MainPage.init();

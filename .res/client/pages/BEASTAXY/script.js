/* BEASTAXY */

import Board from "./BEAST/B.mjs"


class Proposition {
    
    static #developBlocks(blocks) {
        if (!blocks) {
            const lowest = ".block:not(:has(.block))";
            blocks = [...document.querySelectorAll(lowest)];
        }
        blocks = blocks.filter(Boolean);
        if (!blocks.length) return;
        const ringless = ".block:not(:has(> .inner-ring))";
        blocks.forEach(block => {
            if (!block.matches(ringless)) return;
            const ring = document.createElement("div");
            ring.classList.add("inner-ring");
            [...block.childNodes].forEach(child => {
                ring.appendChild(child);
            });
            block.appendChild(ring);
        });
        const parents = [];
        blocks.forEach(block => {
            const parent = block.closest(ringless);
            if (!parents.includes(parent) && parent) {
                parents.push(parent);
            }
        });
        this.#developBlocks(parents);
    }
    
    static init() {
        this.#developBlocks();
        Board.init();
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(Proposition);
} else Proposition.init();

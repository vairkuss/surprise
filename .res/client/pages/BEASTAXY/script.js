/* BEASTAXY */

import Board from "./BEAST/B.mjs"


class Proposition {
    
    static async #fetchData() {
        const res = await fetch(`${location.origin}/get/beast`);
        window.beast = await res.json();
        this.#decodeCanvas();
    }
    
    static #decodeCanvas() {
        for (const collection in beast.canvas) {
            const sets = beast.canvas[collection];
            for (const set in sets) {
                const sprites = sets[set];
                for (const sprite in sprites) {
                    const bytes = new TextEncoder.encode(sprites[sprite]);
                    sprites[sprite] = Buffer.from(bytes);
                }
            }
        }
    }
    
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
        this.#fetchData().then(() => {
            this.#developBlocks();
            Board.init();
        })
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(Proposition);
} else Proposition.init();

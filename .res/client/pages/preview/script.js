/* Preview */


class Preview {
    
    static #inited = 0;
    
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
    
    static #disableAllBut(current) {
        current.classList.add("active");
        const inactive = "#buttons > .btn:not(.active):has(svg)";
        document.querySelectorAll(inactive).forEach(btn => {
            const disabled = btn.matches(".disabled");
            btn.classList.toggle("disabled", !disabled);
        });
        current.classList.remove("active");
    }
    
    static init() {
        if (this.#inited) return;
        this.#inited = 1;
        this.#developBlocks();
        document.querySelectorAll('#buttons > .btn').forEach(btn => {
            btn.onclick = () => this.#disableAllBut(btn);
        });
    }
}


function newColor() {
    const input = document.querySelector("#values");
    if (!input.value) return;
    const values = input.value.split(' ').map(v => {
        return Number.isNaN(v) ? 0 : parseInt(v);
    });
    if (values.length !== 3) {
        input.placeholder = "bad input";
        setTimeout(() => input.placeholder = "h, s, l", 3000);
        return input.value = '';
    }
    input.value = '';
    let [h, s, l] = values;
    h %= 360;
    s = Math.max(5, Math.min(s, 100));
    l = Math.max(5, Math.min(l, 100));
    root.style.setProperty("--m-color", `hsl(${h} ${s} ${l})`);
}


function debug() {
    const input = document.querySelector("#input");
    const hidden = input.matches("hidden");
    input.classList.toggle("hidden", !hidden);
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => Preview.init());
} else Preview.init();

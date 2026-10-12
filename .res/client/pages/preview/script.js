/* Preview */


class Preview {
    
    static #inited = 0;
    
    static #disableAllBut(current) {
        const btns = [...document.querySelectorAll('#buttons > .btn')];
        const index = btns.indexOf(current);
        btns.splice(current, 1);
        btns.forEach(btn => {
            const disabled = btn.matches('disabled');
            btn.classList.toggle("disabled", !disabled);
        });
    }
    
    static init() {
        if (this.#inited) return;
        this.#inited = 1;
        const btns = [...document.querySelectorAll('#buttons .btn')];
        btns.forEach(btn => {
            btn.addEventListener("click", () => this.#disableAllBut(btn));
        });
    }
}


function newColor() {
    const input = document.querySelector("#values");
    const values = input.value.split(" ").map(v => {
        return parseInt(v) === NaN ? 0 : parseInt(v);
    });
    if (values.length !== 3) return console.error(`bad input: "${input.value}"`);
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

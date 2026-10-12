/* Page Loader */

import PF from "./constructor.mjs";
import PC from "./controller.mjs";


class PL { // Page Loader
    
    static #inited = 0;
    
    static #processIcons(icons) {
        for (const name in icons.named) {
            const icon = icons.named[name];
            const tree = new DOMParser().parseFromString(icon, "image/svg+xml");
            icons.named[name] = tree.querySelector(":root");
        }
        icons.random = icons.random.map(icon => {
            const tree = new DOMParser().parseFromString(icon, "image/svg+xml");
            return tree.querySelector(":root");
        });
        return icons;
    }
    
    static async load() {
        const page = document.querySelector("title").textContent;
        const chars = [...document.querySelectorAll(".character")].map(el => el.id);
        const res = await fetch(`${location.origin}/get/data?page=${page}&chars=${JSON.stringify(chars)}`);
        const data = await res.json();
        const tree = new DOMParser().parseFromString(data.grads, "image/svg+xml");
        data.grads = tree.querySelector(":root");
        data.collection = data.collection.split("\r\n");
        data.icons = this.#processIcons(data.icons);
        if (chars.length) data.replicas = JSON.parse(data.replicas);
        if (chars.length) data.sprites = JSON.parse(data.sprites);
        window.data = data;
    }
    
    static init() {
        if (this.#inited) return;
        this.#inited = 1;
        PF.init();
        PC.init();
        window.pending.forEach(init => init());
    }
}


PL.load().then(() => PL.init());

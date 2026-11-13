/* Page Loader */

import PF from "./PF.mjs";
import PC from "./PC.mjs";


class PL { // Page Loader
    
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
    }

    static #preloadImgs(imgs) {
        for (const key in imgs) {
            if (typeof imgs[key] === "string") {
                const preload = document.getElementById("preload");
                const img = preload.appendChild(new Image());
                img.src = imgs[key];
            } else if (typeof imgs[key] === "object") {
                this.#preloadImgs(imgs[key]);
            }
        }
    }
    
    static async load() {
        if (window.data != null) return;
        const page = document.querySelector("title").textContent;
        const chars = [...document.querySelectorAll(".character")].map(el => el.id);
        const res = await fetch(`${location.origin}/get/data?page=${page}&chars=${JSON.stringify(chars)}`);
        const data = await res.json();
        this.#processIcons(data.icons);
        data.sprites = JSON.parse(data.sprites);
        this.#preloadImgs(data.sprites);
        data.replicas = JSON.parse(data.replicas) ?? {};
        if (page === "BEASTAXY") {
            this.#preloadImgs(data.beast.cinematics);
            this.#preloadImgs(data.beast.ui);
        }
        Object.assign(data, { page, chars });
        window.data = data;
        PF.init();
        PC.init();
        window.pending?.forEach(module => module.init());
    }
}


PL.load();

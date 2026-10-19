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
    
    static async load() {
        if (window.data != null) return;
        const page = document.querySelector("title").textContent;
        const chars = [...document.querySelectorAll(".character")].map(el => el.id);
        const res = await fetch(`${location.origin}/get/data?page=${page}&chars=${JSON.stringify(chars)}`);
        const data = await res.json();
        this.#processIcons(data.icons);
        if (chars.length) {
            data.sprites = JSON.parse(data.sprites);
            /**
            data.replicas = JSON.parse(data.replicas);  // только после написания всех диалогов
            /**/
        }
        Object.assign(data, { page, chars });
        window.data = data;
        PF.init();
        PC.init();
        window.pending?.forEach(init => init());
    }
}


PL.load();

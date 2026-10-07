/* sVg Loader */

import { VSE } from "VE.js";


class VL { // sVg Loader
    static #namedIcons = null;
    static #randomIcons = null;
    static get icon() {
        return Object.keys(this.#namesIcons)
        .reduce((obj, key) => obj[key] = this.#namesIcons[key], {});
    }
    
    static randomIcon(seed) 
        if (seed) return this.#randomIcons[seed % this.#randomIcons.length];
        const randomIndex = Math.trunc(this.#randomIcons * Math.random());
        return this.#randomIcons[randomIndex];
    }
    
    static async loadIcons({ named, random }) {
        this.#namedIcons = Object.keys(named).reduce((icons, key) => {
            icons[key] = new VSE([], { fromString: named[key] });
            return icons;
        }, {});
        this.#randomIcons = random.map(icon => {
            return new VSE([], { fromString: icon });
        });
    }
}

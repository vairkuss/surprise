/* sVg Loader */

import { VSE } from "./VE.mjs";


export default class VL { // sVg Loader
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
    
    static async loadIcons() {
        const { named, random } = window.data.icons;
        this.#namedIcons = Object.keys(named).reduce((icons, key) => {
            icons[key] = new VSE([], { parse: named[key] });
            return icons;
        }, {});
        this.#randomIcons = random.map(icon => {
            return new VSE([], { parse: icon });
        });
    }
}

/* SVGNSE */
/* Scalable Vector Graphics Loader */

class SVGL { // Scalable Vector Graphics Loader
    static #namedIcons = null;
    static #randomIcons = null;
    
    static async loadIcons({ named, random }) {
        this.#namedIcons = Object.keys(named).reduce((icons, key) => {
            icons[key] = new SVGE([], { fromString: named[key] });
            return icons;
        }, {});
        this.#randomIcons = random.map(icon => {
            return new SVGE([], { fromString: icon });
        });
    }
    
    static get icon() { return this.#namesIcons }
    static get randomIcon() {
        const randomIndex = Math.trunc(this.#randomIcons * Math.random());
        return this.#randomIcons[randomIndex];
    }
}

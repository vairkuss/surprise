/* I */
/* SVGNSE */
/* Scalable Vector Graphics Loader */

class SVGL extends I { // Scalable Vector Graphics Loader
    static #iconsStorage = null;
    static #loaded = 0;
    static get loaded() { return this.#loaded }
    
    static async init() {
        super.init(() => {
            fetch("http://localhost:7148/get/icons")
            .then(res => res.json())
            .then(strings => {
                this.#iconsStorage = Object.keys(strings).reduce((storage, key) => {
                    const donorTree = new DOMParser.parseFromString(strings[key], "image/svg+xml");
                    const donor = donorTree.querySelector(":root");
                    storage[key] = new SVGE([], { parse: donor });
                    return storage;
                }, {});
                this.#loaded = 1;
            });
        });
    }
    
    static get icon() { return this.#iconsStorage }
}


SVGL.init();

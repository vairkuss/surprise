class SVGL extends Initable { // Scalable Vector Graphics Loader
    static #iconsStorage = null;
    
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
            });
        });
    }
    
    static get icon() { return this.#iconsStorage }
}


//SVGL.init();

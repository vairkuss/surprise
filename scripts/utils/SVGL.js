class Initable {
    static __initiated = 0;
    static get initiated() { return this.__initiated }
    
    static init(func) {
        if (this.__initiated) { return }
        func();
        this.__initiated = 1;
    }
}


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
    
    static getIcon(iconName) { return this.#iconsStorage[iconName] }
}


//SVGL.init();

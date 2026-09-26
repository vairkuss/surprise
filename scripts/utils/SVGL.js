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
            let strings = null;
            /**
            fetch("http://localhost:7148/get/icons") // { iconName: iconStringData }
            .then(async res => strings = await res.json());
            //*/
            AH.holdUntill(30, () => strings != null, () => {
                this.#iconsStorage = Object.entries(strings).reduce((storage, [key, value]) => {
                    storage[key] = new SVGE([], { fromString: value });
                    return storage;
                }, {});
            });
        });
    }
    
    static getIcon(iconName) {
        return this.#iconsStorage[iconName];
    }
}


SVGL.init();
/* Initable */

class Initable {

    static __initiated = 0;

    static get initiated() { return this.__initiated }

    static async init(func) {

        if (this.__initiated) { return }

        func();

        this.__initiated = 1;

    }

}

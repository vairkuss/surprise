/* Sprite Loader */


class SL {
    
    static #sprites = null;
    static get sprite() { return JSON.parse(JSON.stringify(this.#sprites)) }
    
    static loadSprites(sprites) {
        this.#sprites = sprites;
    }
}

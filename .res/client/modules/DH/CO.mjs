/* Character Object */


export default class CO {
    
    static chars = {};
    
    constructor(el) { // Character Object
        CO.chars[this.name] = this;
        this.el = el;
        this.sprites = window.data.sprites[el.id];
    }
    
    get name() { return this.el.id }
    get style() { return this.el.style }
    get computed() { return getComputedStyle(this.el) }
    get rect() { return this.el.getBoundingClientRect() }
    
    get src() { return this.__src }
    set src(src) {
        this.__src = src;
        this.pose = src.match(/\.?([^\d/.]+)[^/]*$/)[1];
        this.el.style.setProperty("--sprite", `url(${src})`);
    }
    
    #random(collection) {
        const keys = Object.keys(collection);
        const key = keys[Math.trunc(keys.length * Math.random())];
        return collection[key];
    }
    
    idle() {
        this.src = this.#random(this.sprites.idle);
    }
    
    hover() {
        this.src = this.#random(this.sprites.hover);
    }
    
    shock() {
        this.src = this.sprites.talk.shocked;
    }
    
    play(animation, pose, pause) {
        console.info(`${this.name}: playing ${{ animation, pose }} for ${pause}s`);
        // play frame animation
        // set after-pose
    }
    
    jump() {
        // char.el jumps
    }
    
    pat() {
        console.info(`you've patted ${this.name}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // moving pointer left and right changes curFrame cursor untill pointerup
        // end animation or phrase
    }
}

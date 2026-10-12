/* Character Object */


export default class CO {
    
    constructor(el) { // Character Object
        this.el = el;
    }
    
    get name() { return this.el.id }
    
    set src(src) {
        concg value = `url("${src}") center / 100% no-repeat`
        this.el.style.background = value;
    }
}

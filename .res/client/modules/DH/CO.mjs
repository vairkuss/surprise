/* Character Object */

import SB from "./SB.mjs";


export default class CO { // Character Object
    
    static chars = [];
    static hide() {
        this.chars.forEach(char => char.hide());
    }
    static idle() {
        this.chars.forEach(char => char.idle());
    }
    static find(name) {
        return this.chars.find(char => char.name === name);
    }
    
    constructor(el) {
        CO.chars.push(this);
        this.el = el;
        this.name = el.id;
        this.anchor = el.querySelector(".anchor");
        this.sprite = el.querySelector(".sprite");
        this.sprites = window.data.sprites[el.id];
        this.idle();
    }
    
    get src() {
        const property = this.el.style.getPropertyValue("--sprite");
        return property.match(/(?<=\/).*(?=\))/)[0];
    }
    set src(src) {
        this.el.style.setProperty("--sprite", `url(/${src})`);
    }
    
    get pose() {
        const pose = this.src.match(/[^/]+?(?=[01]?(\.[^.]*)?$)/)?.at(0);
        if (pose !== "defs") return pose;
    }
    set pose(pose) {
        if (typeof pose === "string") {
            const digit = this.talking ?? 0;
            const src = this.sprites.talk[pose + digit];
            if (src != null) this.src = src;
        }
    }
    
    get talking() {
        return this.src.match(/[01](?=(.[^.]*)?$)/)?.at(0);
    }
    set talking(talking) {
        this.src = this.src.replace(/[01](?=(.[^.]*)?$)/, () => +talking);
        this.pose = this.pose;
    }
    
    #randomFrom(collection) {
        const keys = Object.keys(collection);
        const randomIndex = Math.trunc(keys.length * Math.random());
        const key = keys[randomIndex];
        return collection[key];
    }
    
    idle() {
        this.src = this.#randomFrom(this.sprites.idle);
    }
    hover() {
        this.src = this.#randomFrom(this.sprites.hover);
    }
    
    say(text, pose, replica) {
        this.pose = pose;
        this.jump();
        let sb = SB.getByChar(this);
        if (sb == null) {
            sb = new SB(this);
        } else {
            sb.jump();
        }
        sb.writer.write({ text, replica });
    }
    
    jump() {
        this.sprite.style.bottom = "calc(3 * var(--sub-axis))";
        setTimeout(() => {
            this.sprite.style.removeProperty("bottom");
            if (!this.sprite.getAttribute("style")) {
                this.sprite.removeAttribute("style"); //
            }
        }, 0.2 * 1000);
    }
    
    hide() {
        if (this.el.matches(".frozen")) {
            this.el.style.removeProperty("filter");
            if (this.dir) {
                this.el.style.removeProperty(this.dir);
                this.dir = null;
            }
            setTimeout(() => {
                this.el.classList.remove("frozen");
            }, 0.8 * 1000);
        } else {
            this.el.classList.add("frozen");
            this.idle();
            this.el.style.filter = "opacity(0)";
            const rect = this.el.getBoundingClientRect();
            const terms = {
                right: body.offsetWidth - rect.right,
                bottom: body.offsetHeight - rect.bottom,
                left: rect.left
            };
            const [dir, offset, sizeAxis] = Array.from(Object.entries(terms), (term, i) => {
                return term.concat(["width", "height"][i % 2]);
            }).sort((prev, next) => prev[1] - next[1])[0];
            console.log({dir, offset, sizeAxis})
            void this.el.offsetWidth;
            this.el.style[dir] = `-${offset + rect[sizeAxis]}px`;
            this.dir = dir;
        }
    }
    
    pat() {
        console.info(`you've patted ${this.name}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // moving pointer left and right changes curFrame cursor untill pointerup
        // end animation or phrase
    }
}

window.hide = () => CO.hide()

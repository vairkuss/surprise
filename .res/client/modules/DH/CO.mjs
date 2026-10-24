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
        let sb = SB.bubbles.find(({ char }) => char === this);
        if (sb == null) {
            sb = new SB(this);
            this.el.appendChild(sb.body);
        }
        sb.face.write({ text, replica });
    }
    
    jump() {
        this.sprite.style.bottom = "calc(2 * var(--sub-axis))";
        setTimeout(() => {
            this.sprite.style.removeProperty("bottom");
            if (!this.sprite.getAttribute("style")) {
                this.sprite.removeAtrribute("style");
            }
        }, 0.2 * 1000);
    }
    
    hide() {
        this.el.classList.add("frozen");
        const rect = () => this.el.getBoundingClientRect();
        const init = rect();
        const dir = [
            [["top", "bottom"], -1, init.top],
            [["right", "left"], 1, body.offsetWidth - init.right],
            [["bottom", "top"], 1, body.offsetHeight - init.bottom],
            [["left", "right"],  -1, init.left]
        ].reduce((last, item) => item[2] > last[2] ? last : item);
        const transition = setInterval(() => {
            const curRect = rect();
            const [cur, opp] = dir[0].map(key => curRect[key]);
            const edges = body.getBoundingClientRect();
            const key = dir[0][0];
            const term = opp <= 0 || opp >= edges[key];
            if (term) return clearInterval(transition);
            const dist = html.style.getProperty("--sub-axis");
            this.el.style[key] = `${cur + parseInt(dist) * dir[1]}px`;
        }, 1/30 * 1000);
    }
    
    pat() {
        console.info(`you've patted ${this.name}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // moving pointer left and right changes curFrame cursor untill pointerup
        // end animation or phrase
    }
}

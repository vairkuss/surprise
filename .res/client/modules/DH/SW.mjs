/* Speech Writer */

import CO from "./CO.mjs";


class AP { // Action Plotter

    constructor(detail) {
        this.detail = detail;
        this.plots = [];
    }
    
    plot(trigger, func) {
        const expr = new RegExp(String.raw`(?<!\\)${trigger}(.+?)(?:${trigger}|$)`);
        func = typeof func === "function" ? func : new Function();
        this.plots.push({ trigger, expr, func });
    }
    
    check(ref, processed) {
        return this.plots.some(({ trigger, expr, func }) => {
            const outside = processed.match(expr) == null;
            const processing = trigger !== ref;
            if (outside || processing) return false;
            let content;
            this.detail.text = this.detail.text.replace(expr, (_, cut) => {
                content = cut;
                return `.${cut}.`
            });
            const next = processed.length + 1;
            func(content, next);
            return true;
        });
    }
}


class PV { // Protructed Values
    
    add(tag, key, value) {
        const ent = {};
        ent[key] = value;
        this[tag] = Object.assign(this[tag] ?? {
            get some() {
                for (const key in this) {
                    if (key === "some") continue;
                    if (this[key]) return true;
                }
                return false;
            }
        }, ent);
    }
}


class TS { // Trigger Storage
    
    constructor() {
        this.__KEYS = [];
    }
    
    add(tag, trigger, key) {
        const type = trigger.constructor.name;
        const term = (ref, processed) => type === "RegExp"
                ? processed.match(trigger) != null
                : trigger.includes(ref);
        this[key] = { tag, term };
        this.__KEYS.push(key);
    }
    
    protruct(ref, processed) {
        return this.__KEYS.reduce((pv, key) => {
            const { tag, term } = this[key];
            const value = term(ref, processed);
            pv.add(tag, key, value);
            return pv;
        }, new PV());
    }
}


class TR { // Trigger Reactor
    
    apply(storage) {
        for (const key in this) {
            if (storage[key]) {
                this[key]();
                console.log("tr did:", key, "\n\t", this[key]);
            }
        }
    }
}


export default class SW { // Speech Writer
    
    constructor(sb) { this.sb = sb }
    
    #plot(detail) {
        this.ap = new AP(detail);
        this.ap.plot('√', (_, next) => {
            this.#callNext(next, detail);
        });
        this.ap.plot('©', (pose, next) => {
            this.sb.char.pose = pose;
            this.#callNext(next, detail);
        });
        this.ap.plot('¥', (csv, next) => {
            const [name, pose] = csv.split(':');
            const char = CO.find(name);
            if (char == null) return;
            this.sb.char.talking = false;
            const text = detail.text.slice(next);
            char.say(text, detail.replica, pose);
        });
    }
    
    #set() {
        const source = this.ap.plots.reduce((source, { expr }) => {
            return `${source}|${expr.source}`;
        });
        const plotted = new RegExp(`(?:${source})`);
        this.ts = new TS();
        this.ts.add("ignore", plotted, "plot")
        this.ts.add("ignore", /[\s:]$/, "space");
        this.ts.add("ignore", /×.$/, "poke");
        this.ts.add("anim", '¢', "glitch");
        this.ts.add("anim", 'π', "shake");
        this.ts.add("anim", '∆', "jump");
        this.ts.add("time", "§~", "pause");
        this.ts.add("time", "•!?-.,);3", "stutter");
        this.ts.add("func", '®', "interrupt");
        this.ts.add("func", '✓', "hit");
    }
        
    #assign(detail) {
        this.tr = new TR(detail);
        this.tr.hit = () => this.sb.hit();
        this.tr.jump = () => this.sb.jump();
        this.tr.glitch = () => {
            const charGlitch = this.sb.char.el.matches(".glitch");
            this.sb.char.el.classList.toggle("glitch", !charGlitch);
        }
        this.tr.shake = () => {
            const bubbleShake = this.sb.body.matches(".shake");
            this.sb.body.classList.toggle("shake", !bubbleShake);
        }
        this.tr.pause = () => {
            this.sb.char.talking = false;
            this.paused = true;
            const cooldown = 12 / this.frequency;
            setTimeout(() => this.paused = false, cooldown * 1000);
        }
        this.tr.interrupt = () => {
            this.sb.char.pose = "shocked";
            this.tr.pause();
            this.sb.remove();
            this.#callNext(detail.text.length, detail);
        };
    }
    
    #processChar(ref, processed, detail) {
        const next = processed.length + 1;
        const plotted = this.ap.check(ref, processed);
        if (plotted) return;
        let wait = 1 / this.frequency;
        const escaped = processed.endsWith('\\');
        const meta = "\\¥©®✓•§×√|¢π∆".includes(ref);
        if (!escaped && meta) {
            const pv = this.ts.protruct(ref, processed);
            this.tr.apply(pv);
            const anim = pv.anim.some;
            const ignore = pv.ignore.some;
            const skip = anim || ignore;
            const { stutter, pause } = pv.time;
            wait *= !skip * ((stutter * 4) + (pause * 8));
            console.log(wait);
        } else {
            this.sb.text += ref;
        }
        setTimeout(() => this.#callNext(next, detail), wait * 1000);
    }
    
    #callNext(next, detail) {
        if (next >= detail.text.length && this.writing) {
            const end = new Event(`sfWriteEnd:${detail.replica}`);
            return signal.dispatchEvent(end);
        } else if (detail.text[next] !== '§') {
            this.sb.char.talking = true;
        }
        const call = `sfWrite${next}:${detail.replica}`;
        const event = new CustomEvent(call, { detail });
        signal.dispatchEvent(event);
    }
    
    #boost(signature) {
        if (!this.paused) {
            this.frequency *= 2;
            body.removeEventListener("click", signature, true);
        }
    }
    
    async write(detail) {
        this.sb.text = '';
        this.sb.lifes = 2;
        this.frequency = 20;
        this.writing = true;
        this.#plot(detail);
        this.#set();
        this.#assign(detail);
        const signature = () => this.#boost(signature);
        body.addEventListener("click", signature, true);
        signal.addEventListener(`sfWriteEnd:${detail.replica}`, () => {
            this.sb.className = "sb-body";
            this.sb.char.talking = false;
            this.writing = false;
        }, { once: 1 });
        detail.text.split('').forEach((ref, i) => {
            signal.addEventListener(`sfWrite${i}:${detail.replica}`, e => {
                if (this.writing) {
                    const processed = detail.text.slice(0, i);
                    return this.#processChar(ref, processed, detail);
                }
                const next = i + 1;
                this.#callNext(next, detail);
            }, { once: 1 });
        });
        this.#callNext(0, detail);
    }
}

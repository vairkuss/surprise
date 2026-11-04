/* Speech Writer */

import SB from "./SB.mjs";
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
            }
        }
    }
}


export default class SW { // Speech Writer
    
    constructor(sb) { this.sb = sb }
    
    #plotActions() {
        this.ap = new AP(this.detail);
        this.ap.plot('√', (_, next) => {
            this.#callNext(next);
        });
        this.ap.plot('©', (pose, next) => {
            this.sb.char.pose = pose;
            this.#callNext(next);
        });
        this.ap.plot('¥', (csv, next) => {
            const [name, pose] = csv.split(':');
            const char = CO.find(name);
            if (!char) return;
            this.sb.char.talking = false;
            const text = this.detail.text.slice(next);
            char.say(text, pose, this.detail.replica);
            const recipient = SB.getByChar(char).writer;
            for (let i = next; i < this.detail.text.length; i++) {
                const call = `swCancel${i}:${this.detail.replica}`;
                signal.dispatchEvent(new Event(call));
            }
            for (let i = 0; i < this.pending.length; i++) {
                recipient.pending.push(this.pending.pop());
            }
            this.detail = null;
        });
    }
    
    #storeTriggers() {
        const source = this.ap.plots.slice(1).reduce((source, plot) => {
            return `${source}|${plot.expr.source}`;
        }, this.ap.plots[0].expr.source);
        const plotted = new RegExp(`(?:${source})`);
        this.ts = new TS();
        this.ts.add("ignore", plotted, "plot")
        this.ts.add("ignore", /[\s:]$/, "space");
        this.ts.add("ignore", /°.$/, "pokeout");
        this.ts.add("ignore", "\\", "escape");
        this.ts.add("anim", '¢', "glitch");
        this.ts.add("anim", 'π', "shake");
        this.ts.add("anim", '∆', "jump");
        this.ts.add("time", "§~", "pause");
        this.ts.add("time", "•!?-.,);3", "stutter");
        this.ts.add("func", '®', "interrupt");
        this.ts.add("func", '✓', "hit");
    }
        
    #assignFuncs() {
        this.tr = new TR(this.detail);
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
            this.#callNext(this.detail.text.length);
        };
    }
    
    #processChar(current) {
        const [, processed, ref] = current.match(/(.*)(.)$/);
        const next = processed.length + 1;
        const plotted = this.ap.check(ref, processed);
        if (plotted) return;
        let wait = 1 / this.frequency;
        const escaped = processed.endsWith('\\');
        const meta = "\\¥©®✓•§°√|¢π∆".includes(ref);
        if (!escaped && meta) {
            const pv = this.ts.protruct(ref, processed);
            this.tr.apply(pv);
            const anim = pv.anim.some;
            const ignore = pv.ignore.some;
            const skip = anim || ignore;
            const { stutter, pause } = pv.time;
            wait *= !skip * ((stutter * 4) + (pause * 8));
        } else {
            this.sb.text += ref;
        }
        setTimeout(() => this.#callNext(next), wait * 1000);
    }
    
    #callNext(i) {
        const replica = this.detail.replica;
        if (i >= this.detail.text.length) {
            const writeEnd = new Event(`swWriteEnd:${replica}`);
            signal.dispatchEvent(writeEnd);
        } else {
            if (this.detail.text[i + 1] !== '§') {
                this.sb.char.talking = true;
            }
            const call = `swWrite${i + 1}:${replica}`;
            const callEvent = new CustomEvent(call, this);
            signal.dispatchEvent(callEvent);
        }
        const cancelPrevious = new Event(`swCancel${i}:${replica}`);
        signal.dispatchEvent(cancelPrevious);
    }
    
    #boost(signature) {
        if (!this.paused) {
            this.frequency *= 2;
            body.removeEventListener("click", signature, true);
        }
    }

    #write(e, i) {
        if (this.writing) {
            const current = e.detail.text.slice(0, i);
            return this.#processChar(current);
        }
        this.#callNext(i);
    }

    get writing() { return this.detail != null }
    
    write(detail) {
        this.sb.text = '';
        this.sb.lifes = 2;
        this.frequency = 20;
        this.pending = [];
        this.detail = detail;
        this.#plotActions();
        this.#storeTriggers();
        this.#assignFuncs();
        const boost = () => this.#boost(boost);
        body.addEventListener("click", boost, true);
        for (let i = 0; i <= detail.text.length; i++) {
            signal.addEventListener(`swWrite${i}:${detail.replica}`, e => {
                this.#write(e, i);
            }, { once: 1 });
            signal.addEventListener(`swCancel${i}:${detail.replica}`, () => {
                signal.removeEventListener(`swWrite${i}:${detail.replica}`, e => {
                    this.#write(e, i);
                }, { once: 1 });
            })
        };
        signal.addEventListener(`swWriteEnd:${detail.replica}`, () => {
            this.sb.className = "sb-body";
            this.sb.char.talking = false;
            this.detail = null;
            this.pending.forEach(func => func());
        }, { once: 1 })
        this.#callNext(0);
    }

    onWriteEnd(func) {
        if (!this.writing) return func();
        this.pending.push(func);
    }
}

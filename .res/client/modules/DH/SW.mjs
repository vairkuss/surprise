/* Speech Writer */

import SB from "./SB.mjs";
import CO from "./CO.mjs";


class AP { // Action Plotter

    constructor(detail) {
        this.text = detail.text;
        this.plots = [];
    }
    
    plot(trigger, func) {
        const expr = new RegExp(String.raw`(?<!\\)${trigger}(.+[^${trigger}])$`);
        this.plots.push({ trigger, expr, func });
    }
    
    checkPlotted(uncovered) {
        return this.plots.some(({ trigger, expr, func }) => {
            const content = uncovered.slice(0, -1).match(expr)?.at(1) ?? "";
            const firing = uncovered.endsWith(trigger);
            const next = uncovered.length;
            if (content && firing) {
                console.log({ content, firing, next })
                this.text = this.text.replace(expr, (_, cut) => `.${cut}.`);
            }
            console.log({func: func(content, firing, next), acting: (content && firing)})
            return func(content, firing, next) ?? (content && firing);
        });
    }
}


class TO { // Tag Object

    get some() {
        Object.values(this).every(Boolean)
        for (const key in this) {
            if (typeof this[key] != "boolean") {
                return true;
            }
        }
        return false;
    }
}


class PV { // Protructed Values
    
    add(tag, key, value) {
        if (!this[tag]) this[tag] = new TO();
        this[tag][key] = value;
        console.log(this)
    }
}


class TS { // Trigger Storage
    
    __KEYS = [];
        
    add(tag, trigger, key) {
        const term = (ref, processed) => {
            return trigger.constructor.name === "RegExp"
                ? processed.match(trigger) != null
                : typeof trigger === "function"
                ? trigger(this, ref, processed)
                : trigger.includes(ref);
        }
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
    
    constructor(storage) {
        storage.__KEYS.forEach(key => {
            const tag = storage[key].tag;
            const reaction = {};
            reaction[key] = func => {
                if (func) this[tag][key] = func;
            };
            this[tag] = Object.assign(this[tag] ?? {}, reaction);
        });
    }

    apply(pv) {
        for (const tag in this) {
            for (const key in this[tag]) {
                if (this[tag][key].length) continue;
                if (pv[tag][key]) {
                    this[tag][key]();
                }
            }
        }
    }
}


export default class SW { // Speech Writer
    
    constructor(sb) { this.sb = sb }
    
    #plotActions() {
        this.ap = new AP(this.detail);
        this.ap.plot('©', (pose, firing) => {
            if (firing) {
                this.sb.char.pose = pose;
            }
        });
        this.ap.plot('¥', (csv, firing, next) => {
            if (!csv) return;
            if (!firing) {
                new Promise(res => {
                    this.#callNext(next)
                    res();
                });
                return true;
            }
            const [name, pose] = csv.split(':');
            const char = CO.find(name);
            if (!char) return;
            this.sb.char.talking = false;
            const text = this.detail.text.slice(next);
            char.say(text, pose, this.detail.replica);
            for (let i = next; i < this.detail.text.length; i++) {
                const callCancel = `swCancel${i}:${this.detail.replica}`;
                signal.dispatchEvent(new Event(callCancel));
            }
            SB.getByChar(char).writer.pending = this.pending;
            this.pending = [];
            this.detail = null;
        });
    }
    
    #storeTriggers() {
        const source = this.ap.plots.slice(1).reduce((source, plot) => {
            return `${source}|${plot.expr.source}`;
        }, this.ap.plots[0].expr.source);
        const plotted = new RegExp(`(?:${source})`);
        this.ts = new TS();
        this.ts.add("skip", plotted, "plot")
        this.ts.add("skip", /[\s:]$/, "space");
        this.ts.add("skip", /°.$/, "pokeout");
        this.ts.add("skip", '\\', "escape");
        this.ts.add("skip", '¢', "glitch");
        this.ts.add("skip", 'π', "shake");
        this.ts.add("skip", '∆', "jump");
        this.ts.add("time", "§~", "pause");
        this.ts.add("time", "•!?-.,);3", "stutter");
        this.ts.add("misc", '®', "interrupt");
        this.ts.add("misc", '✓', "hit");
    }
        
    #assignFuncs() {
        this.tr = new TR(this.ts);
        this.tr.skip.jump(() => this.sb.jump());
        this.tr.skip.glitch(() => {
            const charGlitch = this.sb.char.el.matches(".glitch");
            this.sb.char.el.classList.toggle("glitch", !charGlitch);
        });
        this.tr.skip.shake(() => {
            const bubbleShake = this.sb.body.matches(".shake");
            this.sb.body.classList.toggle("shake", !bubbleShake);
        });
        this.tr.time.pause(() => {
            this.sb.char.talking = false;
            this.paused = true;
            const cooldown = 12 / this.frequency;
            setTimeout(() => this.paused = false, cooldown * 1000);
        });
        this.tr.misc.hit(() => this.sb.hit());
        this.tr.misc.interrupt(() => {
            this.sb.char.pose = "shocked";
            this.tr.pause();
            this.sb.remove();
            this.#callNext(this.detail.text.length);
        });
    }
    
    #processChar(uncovered) {
        if (this.ap.checkPlotted(uncovered)) {
            return this.#callNext(uncovered.length);
        }
        const [processed, ref] = uncovered.match(/(.*)(.)$/s).slice(1);
        let wait = 1 / this.frequency;
        const escaped = processed.endsWith('\\');
        const meta = "\\¥©®✓•§°√|¢π∆".includes(ref);
        if (!escaped && meta) {
            const pv = this.ts.protruct(ref, processed);
            this.tr.apply(pv);
            const skip = pv.skip.some;
            const { stutter, pause } = pv.time;
            wait *= !skip * ((stutter * 4) + (pause * 8));
        } else {
            this.sb.text += ref;
        }
        setTimeout(() => this.#callNext(uncovered.length), wait * 1000);
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
        if (this.paused) return;
        this.frequency *= 2;
        body.removeEventListener("click", signature, true);
    }

    #writeChar(e, i) {
        if (this.writing) {
            const current = e.detail.text.slice(0, i);
            return this.#processChar(current);
        }
        this.#callNext(i);
    }

    get writing() { return this.detail != null }
    
    writeReplica(text, replica) {
        this.sb.text = '';
        this.sb.lifes = 2;
        this.frequency = 20;
        this.pending = [];
        this.detail = { text, replica };
        this.#plotActions();
        this.#storeTriggers();
        this.#assignFuncs();
        const boost = () => this.#boost(boost);
        body.addEventListener("click", boost, true);
        for (let i = 0; i <= text.length; i++) {
            const writeChar = e => this.#writeChar(e, i)
            signal.addEventListener(`swWrite${i}:${replica}`, writeChar, { once: 1 });
            signal.addEventListener(`swCancel${i}:${replica}`, () => {
                signal.removeEventListener(`swWrite${i}:${replica}`, writeChar, { once: 1 });
            }, { once: 1 });
        };
        signal.addEventListener(`swWriteEnd:${replica}`, () => {
            this.sb.className = "sb-body";
            this.sb.char.talking = false;
            this.detail = null;
            this.pending.forEach(func => func());
        }, { once: 1 })
        this.#callNext(0);
    }

    onWriteEnd(func) {
        if (this.writing) {
            this.pending.push(func);
        } else {
            func();
        }
    }
}

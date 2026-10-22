/* Speech bubble Face */


class AP { // Action Plotter

    constructor(ref, processed, detail) {
        this.ref = ref;
        this.processed = processed;
        this.detail = detail;
        this.plotted = false;
    }
    
    plot(symb, func) {
        const expr = new RegExp(String.raw`(?<!\\)${symb}(.*?)${symb}?`);
        const active = this.processed.match(expr) != null;
        const ended = this.ref === symb;
        if (active && ended) {
            let content;
            this.detail.text = this.detail.text.replace(expr, (_, cut) => {
                content = cut;
                return `.${cut}.`
            });
            if (typeof func === "function") {
                const next = this.processed.length + 1;
                func(content, next, this.detail);
            }
            this.plotted = true;
        }
    }
}


class TS { // Trigger Storage
    
    constructor(ref, src) {
        this.__REF = ref;
        this.__SRC = src;
        this.__KEYS = [];
    }
    
    add(tag, trigger, key) {
        this["__" + key] = { tag, trigger };
        if (trigger?.constructor.name === "RegExp") {
            this[key] = this.__SRC.match(trigger) != null;
        } else {
            this[key] = trigger?.includes(this.__REF);
        }
        this.__KEYS.push(key);
    }
    
    slice(tag) {
        return this.__KEYS.reduce((ts, key) => {
            const ent = this["__" + key];
            if (ent.tag === tag) {
                ts.add(tag, ent.trigger, key);
            }
            return ts;
        }, new TS(this.__REF, this.__SRC));
    }
    
    get some() {
        return this.__KEYS.some(key => this[key]);
    }
}


class TP { // Trigger Protractor
    
    apply(storage) {
        for (const key in this) {
            if (storage[key] === true) this[key]();
        }
    }
}


export default class SF { // Speech bubble Face
    
    constructor(sb) {
        this.sb = sb;
        this.el = document.createElement("div");
        this.el.className = "face";
    }
    
    #processChar(ref, processed, detail) {
        const ap = new AP(ref, processed, detail);
        const plotted = this.#plot(ap);
        if (plotted) return;
        let wait = 1 / this.frequency;
        const escaped = processed.endsWith('\\');
        const meta = "\\¥©®•§×√|¢π∆".includes(ref);
        if (!escaped && meta) {
            const ts = new TS(ref, src);
            this.#protract(ts);
            this.#act(ts, detail);
            const anim = ts.slice("anim").some;
            const ignore = ts.slice("ignore").some;
            const skip = anim || ignore;
            const { stutter, pause } = ts.slice("time");
            wait *= !skip * ((stutter * 4) + (pause * 8));
        } else {
            this.el.textContent += ref;
        }
        const next = processed.length + 1;
        setTimeout(() => this.#callNext(next, detail), wait * 1000);
    }
    
    #plot(ap) {
        ap.plot('√', (_, next, detail) => {
            this.#callNext(next, detail);
        });
        ap.plot('©', (pose, next, detail) => {
            this.sb.char.pose = pose;
            this.#callNext(next, detail);
        });
        ap.plot('¥', (csv, next, detail) => {
            const [name, pose] = csv.split(':');
            const char = CO.find(name);
            if (char == null) return;
            this.sb.interrupt();
            const text = detail.text.slice(next);
            char.say(text, detail.replica, pose);
        });
        return ap.plotted;
    }
    
    #protract(ts) {
        ts.add("misc", '®', "interrupt");
        ts.add("anim", '¢', "glitch");
        ts.add("anim", 'π', "shake");
        ts.add("anim", '∆', "jump");
        ts.add("time", '§~', "pause");
        ts.add("time", "•!?-.,);3", "stutter");
        ts.add("ignore", /×.$/, "poked");
        ts.add("ignore", /√.*$/, "cut");
        ts.add("ignore", /©.*$/, "posing");
        ts.add("ignore", /¥.*$/, "interfering");
        ts.add("ignore", /(?::|\s)$/, "space");
    }
        
    #act(storage, detail) {
        const tp = new TP();
        tp.interrupt = () => {
            this.sprites.talk.shocked0;
            this.sb.remove();
            this.#callNext(detail.text.length, detail);
        };
        tp.jump = () => this.sb.jump();
        tp.glitch = () => {
            const charGlitch = this.char.el.matches(".glitch");
            this.sb.char.el.classList.toggle("glitch", !charGlitch);
        }
        tp.shake = () => {
            const bubbleShake = this.sb.body.matches(".shake");
            this.sb.body.classList.toggle("shake", !bubbleShake);
        }
        tp.pause = () => {
            this.sb.char.talking = false;
            this.paused = true;
            const cooldown = 12 / this.frequency;
            setTimeout(() => this.paused = false, cooldown * 1000);
        }
        tp.apply(storage);
    }
    
    #callNext(next, detail) {
        if (next >= detail.text.length && this.writing) {
            const end = new Event(`sfWriteEnd${detail.replica}`);
            return signal.dispatchEvent(end);
        } else if (detail.text[next] !== '§') {
            this.sb.char.talking = true;
        }
        const call = `sfWrite${detail.replica}:${next}`;
        const event = new CustomEvent(call, { detail });
        signal.dispatchEvent(event);
    }
    
    #boost(signature) {
        if (!this.paused) {
            this.frequency *= 15;
            document.body.removeEventListener("click", signature, true);
        }
    }
    
    async write(detail) {
        this.el.textContent = '';
        this.sb.lifes = 2;
        this.frequency = 20;
        this.writing = true;
        const signature = () => this.#boost(signature);
        document.body.addEventListener("click", signature, true);
        signal.addEventListener(`sfWriteEnd${detail.replica}`, () => {
            this.el.className = "face";
            this.sb.char.talking = false;
            this.writing = false;
        }, { once: 1 });
        detail.text.split('').forEach((ref, i) => {
            signal.addEventListener(`sfWrite${detail.replica}:${i}`, e => {
                if (this.writing) {
                    const processed = detail.text.slice(0, i);
                    this.#processChar(ref, processed, detail);
                } else {
                    const next = i + 1;
                    this.#callNext(next, detail);
                }
            }, { once: 1 });
        });
        this.#callNext(0, detail);
    }
}

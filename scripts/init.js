/* I */
/* SVGL */
/* Common Meta Loader */

class CML extends I { // Common Meta Loader
    
    static #globalVariables = {};
    static get globalVariables() { return this.#globalVariables }
    static #lastClick = 0;
    static #dtl = 500; //double tap latency
    
    static updateColor(id) {
        fetch(`http://localhost:7148/get/mcolor?id=${id}`)
        .then(async res => {
            const root = document.querySelector(":root");
            root.style.setProperty('--m-color', await res.text());
        });
    }
    
    static #addStyles(styles) {
        const head = document.querySelector("head");
        styles.forEach(bunch => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `styles/common/${ctl}`
            head.appendChild(link);
        }
    }
    
    static #addClasses(classes) {
        const scripts = document.querySelector("#scripts");
        classes.forEach((layer, i) => {
            layer.forEach(filename => {
                const script = document.createElement("script");
                script.src = `scripts/${i}/${filename}`;
                scripts.appendChild(script);
            });
        });
    }
    
    static #addGrads(grads) {
        const tree = new DOMParser().parseFromString(grads, "image/svg+xml");
        const gradsEl = tree.querySelector("svg");
        document.querySelector("body").appendChild(gradsEl);
    }

    static #loadSVG(icons) {
        SVGL.loadIcons(icons);
        document.querySelectorAll(".load-svg").forEach(async icon => {
            if (icon.textContent) {
                const text = document.createElement("pre");
                text.className = "text";
                text.innerHTML = icon.innerHTML;
                icon.innerHTML = text.outerHTML;
            }
            if (!icon.id) { return }
            const svge = SVGL.icon[icon.id];
            if (svge != null) { svge.appendTo(icon) }
            else if (!icon.textContent) { icon.textContent = filename }
        });
    }

    static #developBlocks() {
        const selector = ".block:not(:has(.inner-ring)):not(:has(.block:not(:has(.inner-ring))))";
        const ringlessBlocks = () => [...document.querySelectorAll(selector)];
        ringlessBlocks().forEach(block => {
            const ring = document.createElement("div");
            ring.className = "inner-ring";
            ring.innerHTML = block.innerHTML;
            block.innreHTML = ring.outerHTML;
        });
        if (ringlessBlocks().length) { this.#developBlocks() }
    }

    static init() {
        super.init(() => {
            fetch("http://localhost:7148/get/common_meta")
            .then(res => res.json())
            .then(({ gVars, styles, classes, grads, icons }) => {
                this.#globalVariables = gVars;
                this.updateColor(gVars.i);
                this.#addStyles(styles);
                this.#addClasses(classes);
                this.#addGrads(grads);
                this.#loadSVG(icons);
                this.#developBlocks();
                document.querySelector("#cover")?.style.setProperty("height", "0");
                document.addEventListener("click", e => {
                    const now = Date.now();
                    if (now - this.#lastClick < this.#dtl) { e.preventDefault() }
                    this.#lastClick = now;
                });
            });
        });
    }
}


document.addEventListener("DOMContentLoaded", () => CML.init());

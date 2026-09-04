class Initable {
    static __initialised = 0;
    static get initiated() { return this.__initialised }
    
    static async init(func) {
        if (this.__initialised) { return }
        func();
        this.__initialised = 1;
    }
}


class PM extends Initable {
    
    static #globalVariables = {};
    static get globalVariables() { return this.#globalVariables }
    
    static async #loadGlobalVariables() {
        this.#globalVariables = await fetch("http://localhost:7148/get/variables")
        .then(async response => await response.json());
        this.setColor();
    }
    
    static async setColor(values=null) {
        let [h, s, l] = values ?? await fetch(`http://localhost:7148/get/mcolor`)
        .then(async response => await response.json());
        const root = document.querySelector(":root");
        root.style.setProperty('--m-hue', `${h}`);
        root.style.setProperty('--m-sat', `${s}%`);
        root.style.setProperty('--m-lum', `${l}%`);
    }
    
    
    static async #addMeta() {
        // STYLES
        const headElement = document.querySelector("head");
        const commonStyles = await fetch("http://localhost:7148/get/common_styles")
        .then(async response => await response.json());
        headElement.insertAdjacentHTML(
            "beforeend",
            commonStyles
                .map(ctl => `<link rel="stylesheet" href="../styles/common/${ctl}" />`)
                .concat([
                    '<meta charset="UTF-8"/>',
                    '<link rel="shortcut icon" href="../res/icons/rune.svg" type="image/svg+xml" sizes="any">',
                    '<link rel="manifest" href="../res/databases/manifest.json">'
                ])
                .join("")
        );
        
        // CLASSES
        fetch("http://localhost:7148/get/classes")
        .then(async response => await response.json())
        .then(classes => document.addEventListener("DOMContentLoaded", () => {
            const scripts = document.querySelector("#scripts");
            classes.forEach(url => {
                const script = document.createElement("script");
                script.src = `../scripts/classes/${url}`;
                scripts.appendChild(script);
                window[url.split(".").shift()].init();
            });
        }));
        
        // GRADS
        const grads = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        grads.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        grads.setAttribute("id", "grads");
        grads.innerHTML = `
<defs>
    <linearGradient id="text-grad" x1="37%" y1="2%" x2="63%" y2="98%">
        <stop offset="0%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
        <stop offset="25%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.6))" />
        <stop offset="50%" stop-color="hsl(calc(var(--m-hue) + 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
        <stop offset="75%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.9))" />
        <stop offset="100%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
    </linearGradient>
    <linearGradient id="dis-grad" x1="37%" y1="2%" x2="63%" y2="98%">
        <stop offset="0%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.1), calc(var(--m-lum) * 0.55))" />
        <stop offset="25%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.05), calc(var(--m-lum) * 0.4))" />
        <stop offset="50%" stop-color="hsl(calc(var(--m-hue) + 5), calc(var(--m-sat) * 0.1), calc(var(--m-lum) * 0.55))" />
        <stop offset="75%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.05), calc(var(--m-lum) * 0.7))" />
        <stop offset="100%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.1), calc(var(--m-lum) * 0.55))" />
    </linearGradient>
</defs>
`;
        document.querySelector("body").appendChild(grads);
    }
    

    static async #developBlocks() {
        [...document.querySelectorAll(".block")]
            .filter(
                blockElement => ![...blockElement.children].flatMap(
                    blockChild => blockChild.className.split(" ")
                ).includes("inner-ring")
            )
            .forEach(
                blockElement => {
                    blockElement.innerHTML = `
<div class="inner-ring">
    ${blockElement.innerHTML}
</div>
`;
                }
            );
        if (
            ![...document.querySelectorAll(".block")].every(
                blockElement => [...blockElement.children].some(
                    blockChild => blockChild.className === "inner-ring"
                )
            )
        ) { this.#developBlocks() }
    }
    

    static async #loadSVG() {
        document.querySelectorAll(".icon").forEach(
            async iconElement => {
                if (iconElement.textContent) {
                    iconElement.innerHTML = `<div class="text">${iconElement.textContent}</div>`;
                }
                const filename = iconElement.getAttribute("icon");
                if (filename == null) { return }
                const url = `../res/icons/${filename}.svg`;
                const file = await fetch(url)
                .then(async response => await response.text());
                    
                try {
                    if (file === "Not Found") {
                        throw new Error(`File not found: "${url}"`);
                    }
                    iconElement.innerHTML = file;
                } catch (e) {
                    
                    console.error(e);
                    iconElement.textContent = iconElement.textContent
                        ? iconElement.textContent
                        : filename;
                }
            }
        );
    }
    
    
    static async #breakLines() {
        document.querySelectorAll(".text").forEach(
            async textElement => {
                let text = textElement.textContent.split(" ");
                const maxWidth = window.getComputedStyle(textElement.parentElement).width;
                console.log(textElement.textContent, maxWidth);
                let string = [];
                
            }
        )
    }
    

    static async init() {
        super.init(() => {
            this.#loadGlobalVariables();
            this.#addMeta();
            this.#developBlocks();
            this.#loadSVG()
            /*.then(() => this.#breakLines())*/;
            document.querySelector("html").setAttribute("style", "")
            document.querySelector("#cover")?.style.setProperty("height", "0");
        });
    }
}


/**/
document.addEventListener(
    "DOMContentLoaded",
    () => {
        //*/
        PM.init()
        /**/
    }
);
//*/
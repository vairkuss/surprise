class PM {
    
    static async #addMeta() {
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
    }
    
    
    static async #loadGlobalVariables() {
        this.variables = await fetch("http://localhost:7148/get/variables");
    }
    
    static async setColor([h, s, l]) {
        const root = document.querySelector(":root");
        root.style.setProperty('--m-hue', `${h}`);
        root.style.setProperty('--m-sat', `${s}%`);
        root.style.setProperty('--m-lum', `${l}%`);
    }
    
    
    static async #addSVGGradients() {
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
                
                const filename = iconElement.getAttribute("icon");
                const url = `../res/icons/${filename}.svg`;
                
                try {
                    
                    if (iconElement.textContent) {
                        iconElement.innerHTML = `
<div class="text">
    ${iconElement.textContent}
</div>
`;
                    }
                    if (filename == null) { return }
                    
                    const file = await fetch(url);
                    const svg = await file.text();
                    if (svg === "Not Found") {
                        throw new Error(`File not found: "${url}"`);
                    }
                    iconElement.innerHTML = svg;
                    
                    const svgElement = iconElement.querySelector("svg");
                    svgElement.style.setProperty("width", "var(--icon-size)");
                    svgElement.style.setProperty("height", "var(--icon-size)");
                    
                } catch (e) {
                    
                    console.error(e);
                    iconElement.textContent = iconElement.textContent
                        ? iconElement.textContent
                        : url.split("/").splice(-1);
                    
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
    

    static #initiated = 0;
    static get initiated() {
        return this.#initiated;
    }
    
    static get globalVariables() {
        return this.#globalVariables;
    }

    static async init() {
        if (this.#initiated) { return }
        let ready = 0;
        this.#globalVariables = await fetch("http://localhost:7148/get/variables")
        .then((variables) => {
            ready++;
            return JSON.parse(variables);
        });
        this.#loadGlobalVariables()
        .then(() => this.setColor([149, 80, 90]))
        .then(() => ready++);
        this.#addMeta()
        .then(() => ready++);
        this.#addSVGGradients()
        .then(() => ready++);
        this.#developBlocks()
        .then(() => this.#loadSVG())
        .then(() => this.#breakLines())
        .then(() => ready++);
        await new Promise(() => {
            while (ready < 5) {}
            this.#initiated = 1;
        });
    }
}


/**/
document.addEventListener(
    "DOMContentLoaded",
    () => {
        //*/
        PM.init()
        .then(() => document.querySelectorAll(".character").forEach(async el => {
            el.addEventListener("pointerenter", async () => {
                el.src = await fetch(`http://localhost:7148/get/random_sprite?${el.id}=active`);
            });
            el.addEventListener("pointerleave", async () => {
                el.src = await fetch(`http://localhost:7148/get/random_sprite?${el.id}=idle`);
            });
            el.addEventListener("click", async () => {
                if (!DM.active) {
                    DM.dialogue(el.id);
                }
            });
        }));
        /**/
    }
);
//*/
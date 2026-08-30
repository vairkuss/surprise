class CompletePage {
    
    static #addMeta = async function() {
        const headElement = document.querySelector("head");
        const response = await fetch("http://localhost:7142/common_styles");
        const commonStyles = await response.json();
        headElement.insertAdjacentHTML(
            "beforeend",
            commonStyles
                .map(ctl => `<link rel="stylesheet" href="../styles/${ctl}" />`)
                .concat(['<meta charset="UTF-8"/>'])
               .join("")
        );
    }
    
    
    static #addSVGGradients() {
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
    

    static #developBlocks() {
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
    

    static #loadSVG() {
    
        document.querySelectorAll(".icon").forEach(
            async iconElement => {
                
                const filename = iconElement.getAttribute("icon");
                const url = `../res/icons/${filename}.svg`;
                
                try {
                    
                    if (iconElement.textContent &&0) {
                        const iconStyle = window.getComputedStyle(iconElement);
                        console.log(iconElement.textContent, iconStyle.fontSize)
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
    
    
    static #breakLines() {
        document.querySelectorAll(".text").forEach(
            async textElement => {
                let text = textElement.textContent.split(" ");
                const maxWidth = window.getComputedStyle(textElement.parentElement).width;
                console.log(textElement.textContent, maxWidth);
                let string = [];
                
            }
        )
    }


    static #used = 0;

    static init() {
        if (this.#used) { return }
        this.#used = 1;
        this.#addMeta();
        this.#addSVGGradients();
        this.#developBlocks();
        this.#loadSVG();
        this.#breakLines();
        document.querySelector("html").setAttribute("style", "")
        document.querySelector("#cover").style.setProperty("height", "0");
    }
}


function getInputValues () { 
    const msgElement = document.querySelector("#message");
    const inputElement = document.querySelector("#values");
    try {
        msgElement.innerText = "";
        let values = inputElement.value.split(",")
            .map(v => parseInt(v) ? parseInt(v) : 0);
        if (values.length !== 3) { 
            throw new Error(
`h, s, l parameters must be just numbers
and properly separated with commas
expected: 3
got:      ${values.length}`
            );
        }
        values[0] %= 360;
        values[1] = Math.max(5, Math.min(values[1], 100));
        values[2] = Math.max(5, Math.min(values[2], 100));
        return values;
    } catch (e) {
        msgElement.innerText = e.toString();
        console.error(e);
    }
}

function newColor (values=null) {
    const input = values ?? getInputValues();
    if (input != null) {
        const [h, s, l] = input;
        const root = document.querySelector(":root");
        root.style.setProperty('--m-hue', `${h}`);
        root.style.setProperty('--m-sat', `${s}%`);
        root.style.setProperty('--m-lum', `${l}%`);
    }
}


let debugModeOn = -1;
function debug() {
    const inputElement = document.querySelector("#input");
    debugModeOn *= -1;
    inputElement.style.setProperty("transform", debugModeOn > 0 ? "scale(100%)" : "scale(0)");
    inputElement.style.setProperty("opacity", debugModeOn > 0 ? "100%" : "0");
}

/**/
document.addEventListener(
    "DOMContentLoaded",
    () => {
        //*/
        CompletePage.init();
        FunctionSetter?.init();
        /**/
    }
);
//*/
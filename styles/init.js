class CompletePage {
    static #addMeta () {
        const headElement = document.querySelector("head");
        headElement.insertAdjacentHTML(
            "beforeend",
            ["colorctl", "textctl", "bgctl", "blockctl", "buttonctl"]
                .map(v => `<link rel="stylesheet" href="${v}.css" />`)
                .concat([
                    '<meta charset="UTF-8"/>'
                ])
               .join("")
        );
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
                
                const url = iconElement.getAttribute("path");
                
                try {
                    
                    if (iconElement.textContent) {
                        const iconStyle = window.getComputedStyle(iconElement);
                        iconElement.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="72vw" height="var(--icon-size)">
    <text x="50%" y="50%" class="text">
        ${iconElement.textContent}
    </text>
</svg>
`;
                    }
                    if (url == null) { return }
                    
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

    static #ready = 0;

    static init() {
        if (this.#ready) { return }
        this.#addMeta();
        this.#developBlocks();
        this.#loadSVG();
        this.#ready = 1;
    }
}

/**
window.addEventListener(
    "load",
    e => {
        e.preventDefault();
        //*/
        CompletePage.init();
        /**
    }
);
//*/
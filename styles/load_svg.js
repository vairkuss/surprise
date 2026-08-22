 function loadSVG() {
    document.querySelectorAll(".icon").forEach(
        
            async iconElement => {
                
                const url = iconElement.getAttribute("path");
                
                try {
                    
                    if (url == null) {
                        if (iconElement.textContent) {
                            iconElement.innerHTML = `
<svg>
  <text x="0" y="0" font-family="infex" font-size="${window.getComputedStyle(iconElement).fontSize щщ то}" fill="url(#text-grad)">${iconElement.textContent}</text>
</svg>
`;
                            return;
                        }
                        throw new Error(`iconElement.textContent is undefined`);
                    }
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
                    
                    url = url ?? iconElement.textContent
                    console.error(e);
                    iconElement.style.setProperty("font-family", "monospace");
                    iconElement.textContent = url.split("/").splice(-1);
                    
                }
            }
        );
}

/*
window.addEventListener(
    "load",
    e => {
        e.preventDefault();
        //*/
        loadSVG();
        /*
    }, 
    {once: 1}
);
//*/
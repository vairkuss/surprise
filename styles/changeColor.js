/**/
document.querySelector("body").insertAdjacentHTML("beforeend", `
<svg id="grads" xmlns="http://www.w3.org/2000/svg"></svg>
<div id="input" class="block" style="
align-content: space-evenly;
position: relative;
top: 0;
bottom: auto;
transform: scale(0);
opacity: 0;
will-change: transition, opacity;
transition:
    0.5s transform ease-out,
    0.5s opacity ease-out;
">
    <input type="text" id="values" placeholder="h, s, l" value="714, 825, 285" style="
margin: auto;
height: 2rem;
background: hsl(var(--m-hue), var(--m-sat), var(--m-lum));
border: 0.2rem solid hsl(var(--m-hue), calc(var(--m-sat) * 0.2), calc(var(--m-lum) * 0.1));
border-radius: 2rem;
text-align: center;
" />
    <pre id="message" style="
overflow: show;
max-width: 50%;
min-height: 30%;
margin: auto;
"></pre>
    <div class="btn block" id="execute" onclick="newColor()">
        <div class="icon">submit</div>
    </div>
</div>
`);

document.querySelector("#grads").innerHTML = `
<defs>
    <linearGradient id="text-grad" x1="37%" y1="2%" x2="63%" y2="98%">
        <stop offset="0%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
        <stop offset="25%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.6))" />
        <stop offset="50%" stop-color="hsl(calc(var(--m-hue) + 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
        <stop offset="75%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.9))" />
        <stop offset="100%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
    </linearGradient>
</defs>
`;
/**/

const msgElement = document.querySelector("#message");

function inputValues () { 
    try {
        const inputElement = document.querySelector("#values");
        msgElement.innerText = "";
        var values = inputElement.value.split(",")
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
    }
}

function newColor () {
    const input = inputValues();
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
document.querySelector("body").innerHTML +=
`
    <svg style="display:none">
        <defs>
            <linearGradient id="text-grad" x1="37%" y1="2%" x2="63%" y2="98%">
                <stop offset="0%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
                <stop offset="25%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.6))" />
                <stop offset="50%" stop-color="hsl(calc(var(--m-hue) + 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
                <stop offset="75%" stop-color="hsl(var(--m-hue), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.9))" />
                <stop offset="100%" stop-color="hsl(calc(var(--m-hue) - 5), calc(var(--m-sat) * 0.8), calc(var(--m-lum) * 0.75))" />
            </linearGradient>
        </defs>
    </svg>
    <div id="input" style="
display: none;
flow: vertical;
align-content: space-evenly;
position: relative;
top: 0;
bottom: auto;
margin: auto;
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
        <div class="btn" id="execute">
            <div class="inner-ring">
                <div class="icon"><span>submit</span></div>
            </div>
        </div>
    </div>
`;

const inputElement = document.querySelector("#values");
const btnElement = document.querySelector("#execute");
const msgElement = document.querySelector("#message");

function inputValues () { 
    try {
        msgElement.innerText = "";
        const values = inputElement.value.split(",")
            .map(v => parseInt(v))
            .filter(v => v.toString() !== "NaN");
        if (values.length !== 3) { 
            throw new Error(
`h, s, l parameters must be just numbers",
and properly separated with commas
expected: 3
got:      ${values.length}`
            );
        }
        values[0] %= 360;
        values[1] = Math.max(10, Math.min(values[1], 100));
        values[2] = Math.max(10, Math.min(values[2], 100));
        return values;
    } catch (e) {
        msgElement.innerText = e.toString();
    }
}

function newColor () {
    let input = inputValues();
    if (input !== undefined) {
        let h, s, l;
        [h, s, l] = input;
        let root = document.querySelector(":root");
        root.style.setProperty('--m-hue', `${h}`);
        root.style.setProperty('--m-sat', `${s}%`);
        root.style.setProperty('--m-lum', `${l}%`);
    }
}

btnElement.addEventListener("click", newColor);

let debugModeOn = -1;

function debugModeSwitch() {
    const inputElement = document.querySelector("#input");
    debugModeOn *= -1;
    inputElement.style.setProperty("display", debugModeOn > 0 ? "flex" : "none");
}
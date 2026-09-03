class FunctionSetter {
    
    static #disableAllBut(btnPressed) {
        let btns = [...document.querySelectorAll('#buttons .btn')];
        const curBtnIndex = btns.indexOf(btnPressed);
        btns = btns.slice(0, curBtnIndex).concat(btns.slice(Math.min(curBtnIndex + 1, btns.length - 1), btns.length - 1))
        btns.forEach(
            btn => {
                const btnClasses = btn.className.split(' ');
                if (btnClasses.includes('disabled')) {
                    btn.className = btnClasses.slice(0, btnClasses.length - 1).join(" ");
                } else {
                    btn.className = btnClasses.concat(['disabled']).join(" ");
                }
            }
        );
    }


    static #initialised = 0;
    
    static init() {
        if (this.#initialised) { return }
        let btns = [...document.querySelectorAll('#buttons .btn')];
        btns./*slice(0, btns.length - 1).*/forEach(
            btn => btn.addEventListener("click", () => this.#disableAllBut(btn))
        );
        this.#initialised = 1;
    }
}


function newColor () { 
    const msgElement = document.querySelector("#message");
    const inputElement = document.querySelector("#values");
    try {
        msgElement.innerText = "";
        let values = inputElement.value.split(",")
            .map(v => parseInt(v) ? parseInt(v) : 0);
        if (values.length !== 3) { 
            throw new Error([
                `параметры h, s, l должны быть целыми`,
                `числами и правильно разделены запятыми`,
                `ожидалось: 3`,
                `получено:  ${values.length}`
            ].join("\n"));
        }
        values[0] %= 360;
        values[1] = Math.max(5, Math.min(values[1], 100));
        values[2] = Math.max(5, Math.min(values[2], 100));
        PM.setColor(values);
    } catch (e) {
        msgElement.innerText = e.toString();
        console.error(e);
    }
}


let debugModeOn = -1;
function debug() {
    const inputElement = document.querySelector("#input");
    debugModeOn *= -1;
    inputElement.style.setProperty("transform", debugModeOn > 0 ? "scale(100%)" : "scale(0)");
    inputElement.style.setProperty("opacity", debugModeOn > 0 ? "100%" : "0");
}


FunctionSetter.init();
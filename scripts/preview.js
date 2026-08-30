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
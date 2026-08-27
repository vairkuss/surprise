class FunctionSetter {
    
    static #disableAllBut(btnPressed) {
        console.log(document.querySelectorAll('#buttons .btn'));
        let btns = [...document.querySelectorAll('#buttons .btn')];
        const curBtnIndex = btns.indexOf(btnPressed);
        console.log(btns);
        btns.splice(curBtnIndex).splice(btns.length-1);
        console.log(btns);
        btns.forEach(
            btn => {
                const btnClasses = btn.className.split(' ');
                if (btnClasses.includes('disabled')) {
                    btn.className = btnClasses.splice(btnClasses.length - 1).join(" ");
                } else {
                    btn.className += ' disabled';
                }
            }
        );
    }


    static #initialised = 0;
    
    static init() {
        if (this.#initialised) { return }
        console.log("buttons: ", document.querySelectorAll('#buttons .btn'));
        console.log("first button: ", document.querySelectorAll('#buttons .btn')[0]);
        console.log("buttons in list: ", [...document.querySelectorAll('#buttons .btn')]);
        console.log("buttons to str: ", [...document.querySelectorAll('#buttons .btn')].map(v => v.toString()));
        document.querySelectorAll('#buttons .btn').forEach(
            btn => btn.addEventListener(
                "click",
                () => {
                    console.log(btn, " has got the listener");
                    this.#disableAllBut(btn);
                }
            )
        );
        this.#initialised = 1;
        console.log("FunctionSetter initialised");
    }
}


document.addEventListener(
    "DOMContentLoaded",
    () => FunctionSetter.init()
);
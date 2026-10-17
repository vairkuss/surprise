/* Page Controller */


export default class PC { // Page Controller
    
    static #lastClick = 0;
    static #dtl = 300; //double tap latency
    
    static #setGlobals() {
        window.signal = new EventTarget();
        window.root = document.querySelector("#content");
        window.transition = (url, [x, y]) => this.transition(url, [x, y]);
        window.log = (...args) => {
            const caller = new Error().stack.toString().split('\n')[2];
            console.debug(caller, ...args);
            fetch(`${location.origin}/post/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pathname: location.pathname, args, caller })
            });
        }
    }
    
    static #spawn() {
        const item = sessionStorage.getItem("transition");
        if (item != null) {
            const [x, y] = JSON.parse(item);
            root.style.transition = "none";
            setTimeout(() => {
                root.style.filter = "opacity(0)";
                root.style.translate = `calc(${x} * 100vw) calc(${y} * -100vh)`;
                setTimeout(() => {
                    root.style.transition = '';
                    root.style.filter = '';
                    root.style.translate = '';
                }, 1/60 * 1000);
            }, 1/60 * 1000);
        }
        document.body.removeAttribute("style");
        const cover = document.querySelector("#cover");
        cover.style.height = 0;
    }
    
    static transition(url, [x, y]) {
        root.style.translate = `calc(${-x} * 100vw) calc(${-y} * -100vh)`;
        root.style.filter = "opacity(0)";
        cover.style.height = "250vh";
        sessionStorage.setItem("transition", JSON.stringify([x, y]));
        fetch(`${location.origin}/post/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.data)
        });
        setTimeout(() => location.replace(url), .6 * 1000);
    }
    
    static init() {
        this.#setGlobals();
        this.#spawn();
        document.addEventListener("click", e => {
            const now = Date.now();
            const clickInterval = now - this.#lastClick;
            const doubleTap = clickInterval < this.#dtl;
            if (doubleTap) e.preventDefault();
            this.#lastClick = now;
        });
    }
}

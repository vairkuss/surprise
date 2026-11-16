/* Page Controller */


export default class PC { // Page Controller
    
    static #lastClick = 0;
    static #dtl = 300; //double tap latency
    
    static #setGlobals() {
        window.html = document.querySelector(":root");
        window.body = document.body;
        window.root = document.querySelector("#content");
        window.signal = new EventTarget();
        window.send = e => signal.dispatchEvent(new Event(e));
        window.transition = (url, [x, y]) => {
            root.style.translate = `calc(${-x} * 100vw) calc(${-y} * -100vh)`;
            root.style.filter = "opacity(0)";
            cover.removeAttribute("style");
            sessionStorage.setItem("transition", JSON.stringify([x, y]));
            fetch(`${location.origin}/post/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(window.data)
            });
            setTimeout(() => location.replace(url), .6 * 1000);
        }
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
    
    static #setListeners() {
        body.addEventListener("click", e => {
            const now = Date.now();
            const clickInterval = now - this.#lastClick;
            const doubleTap = clickInterval < this.#dtl;
            if (doubleTap) e.preventDefault();
            this.#lastClick = now;
        });
        signal.addEventListener("pcChangeClass", e => {
            const { el, action, args } = e.detail;
            this.styleChangePreventer.disconnect();
            el.classList[action](...args);
            this.setObservers();            
        });
        signal.addEventListener("pcChangeStyle", e => {
            const { el, pairs } = e.detail;
            for (const [prop, value] of pairs) {
                el.style.setProperty(prop, value);
            }
            this.styleChangePreventer.disconnect();
            el.classList[action](...args);
            this.setObservers();            
        });
    }


    static styleChangePreventer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === "class") {
                mutation.target.classList.value = mutation.oldValue;
            } else if (mutation.attributeName === "style") {
                mutation.target.setAttribute("style", mutation.oldValue);
            }
        }
    });

    static #setObservers() {
        this.styleChangePreventer.observe(document, { attributes: true });
    }
    
    static #appear() {
        const item = sessionStorage.getItem("transition");
        if (item != null) {
            const [x, y] = JSON.parse(item);
            root.style.transition = "none";
            void root.offsetWidth;
            root.style.filter = "opacity(0)";
            root.style.translate = `calc(${x} * 100vw) calc(${y} * -100vh)`;
            void root.offsetWidth;
            root.style.transition = '';
            root.style.filter = '';
            root.style.translate = '';
        }
        sessionStorage.removeItem("transition");
        body.removeAttribute("style");
        cover.style.height = 0;
    }
    
    static #setColor() {
        const mColor = localStorage.getItem("mColor");
        if (mColor != null) {
            html.style.setProperty("--m-color", mColor);
        }
    }
    
    static init() {
        this.#setGlobals();
        this.#setListeners();
        this.#setObservers();
        this.#setColor();
        this.#appear();
    }
}

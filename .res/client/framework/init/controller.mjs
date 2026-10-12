/* Page Controller */


export default class PC { // Page Controller
    
    static #lastClick = 0;
    static #dtl = 500; //double tap latency
    
    static spawn() {
        const [x, y] = window.data.transition ?? [0, 0];
        window.data.transition = null;
        console.log({x, y});
        root.style.transition = "none";
        setTimeout(() => {
            root.style.filter = "opacity(0)"
            root.style.translate = `calc(${x} * 100vw) calc(${y} * -100vh)`;
            root.style.transition = '';
            setTimeout(() => {
                root.style.filter = '';
                root.style.translate = '';
            }, 1/60 * 1000);
        }, 1/60 * 1000);
        cover.style.height = 0;
    }
    
    static transition(url, [x, y]) {
        root.style.translate = `calc(${-x} * 100vw) calc(${-y} * -100vh)`;
        root.style.filter = "opacity(0)";
        cover.style.height = "250vh";
        window.data.transition = [x, y];
        fetch(`${location.origin}/post/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.data)
        });
        setTimeout(() => location.replace(url), 1000 * .6);
    } // localStorage - локально для страницы
    
    static init() {
        window.root = document.querySelector(":root");
        window.cover = document.querySelector("#cover");
        window.transition = this.transition.bind(this);
        this.spawn();
        document.addEventListener("click", e => {
            const now = Date.now();
            const clickInterval = now - this.#lastClick;
            const doubleTap = clickInterval < this.#dtl;
            if (doubleTap) e.preventDefault();
            this.#lastClick = now;
        });
    }
}

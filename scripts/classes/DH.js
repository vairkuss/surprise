class DH extends Initable {
    static #cursor = {};
    static #active = 0;
    static get active() {
        return this.#active;
    }
    
    static proceed({ id, text, pose, pause }) {
        setTimeout((pause ?? 0) * 1000, () => {
            alert(`${id}: ${text}`);
        });
    }
    
    static async dialogue(character) {
        this.#active = 1;
        if (this.#cursor.get(character) == null) { this.#cursor[character] = 0 }
        const current = await fetch(`http://localhost:7148/get/replicas?p=${window.href.split("/").pop()}&c=${character}:${this.cursor[character]}`)
        .catch((e) => { console.error(e); return; });
        current.get("before")?.forEach(({id, pose}) => document.querySelector(`#${id}`).src = pose)
        replicas.forEach((replica, i, a) => {
            this.proceed(replica);
        });
        this.#active = 0;
    }
    
    static async init() {
        super.init(() => {
            document.querySelector(".character").forEach(el => {
                el.addEventListener("pointerleave", async () => {
                    el.src = await fetch(`http://get/character_random_sprite?${el.id}=idle`);
                });
                el.addEventListener("pointerenter", async () => {
                    el.src = await fetch(`http://get/character_random_sprite?${el.id}=hover`);
                });
                el.addEventListener("click", () => {
                    this.dialogue(el.id);
                });
            });
        });
    }
}
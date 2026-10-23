/* Id Generator */


export default class IG { // Id Generator
    
    static #bank = {};
    
    static add(el, tag) {
        tag = tag ?? el.tagName;
        if (!(tag in this.#bank)) {
            this.#bank[tag] = [];
        }
        const group = this.#bank[tag];
        const free = group.indexOf(undefined);
        const full = free < 0;
        const index = full ? group.length : free;
        const id = tag + index;
        group.splice(index, 1, id);
        el.setAttribute("id", id);
        // ловить ивент ремува и подставлять свою функцию
        // TODO: найти ивент ремува в интернете
        /**
        el.addEventListener("remove", () => {
            this.remove(el);
        }, { capture: 1, once: 1 });
        /**/
        return id;
    }
    
    static remove(el) {
        const id = el.getAttribute("id") ?? "";
        const [, tag, index] = id.match(/(\w+)(\d+)/) ?? [];
        const group = this.#bank[tag];
        if (group == null) return;
        group[index] = undefined;
        const last = group.findLastIndex(x => x !== undefined);
        group.splice(last + 1);
        if (!group.length) delete this.#bank[tag];
        el.remove();
        return el;
    }
}

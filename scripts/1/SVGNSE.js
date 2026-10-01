/* AF */
/* Scalable Vector Graphics NameSpace Element */

class SVGNSE { // Scalable Vector Graphics NameSpace Element
    constructor(elName, options) {
        const { id, cn, fromString: data, parent } = options ?? {};
        const xmlns = "http://www.w3.org/2000/svg";
        this.el = data == null
            ? document.createElementNS(xmlns, elName)
            : new DOMParser().parseFromString(data, "image/svg+xml").querySelector(elName);
        this.raw = data ?? this.el.outerHTML;
        if (id != null) { this.setAttribute("id", id) }
        if (cn != null) { this.addClass(cn) }
        if (parent != null) { this.appendTo(parent) }
    }
    
    get id() { return this.el.getAttribute("id") }
    get className() { return this.el.getAttribute("class") }
    get children() { return this.el.children }
    
    setAttributes(...pairs) { pairs.forEach(pair => this.el.setAttribute(...pair)) }
    setAttribute(attr, value) { this.el.setAttribute(attr, value) }
    getAttribute(attr) { return this.el.getAttribute(attr) }
    
    addClass(newCN) {
        if (this.className?.includes(newCN)) { return }
        const updCN = (this.className ?? "").split(" ").filter(cn => cn).concat([newCN]).join(" ");
        this.setAttribute("class", updCN);
    }
    
    removeClass(rmCN) {
        const updCN = (this.className ?? "").split(" ").filter(cn => cn && cn !== rmCN).join(" ");
        this.setAttribute("class", updCN);
    }
    
    appendChild(el) { this.el.appendChild(el) }
    appendTo(el) { el.appendChild(this.el) }
    remove() { this.el.remove() }
    
    cloneChildren(el) {
        [...el.children].forEach(childEl => this.el.appendChild(childEl.cloneNode(true)));
    }
}


class SVGUE extends SVGNSE { // Scalable Vector Graphics Use Element
    constructor(href, options) {
        super("use", options);
        this.setAttribute("href", href);
    }
}


class SVGPE extends SVGNSE { // Scalable Vector Graphics Path Element
    constructor(d, options) {
        super("path", options);
        this.setAttribute("d", d);
    }
    
    setPath(d) { this.setAttribute("d", d) }
}

class SVGRE extends SVGNSE { // Scalable Vector Graphics Rect Element
    constructor([w, h, x, y], options) {
        h = h ?? w;
        super("rect", options);
        if (w != null) {
            this.setAttribute("width", w);
            this.setAttribute("height", h);
            if (x != null) { this.setAttribute("x", x) }
            if (y != null) { this.setAttribute("y", y) }
        }
    }
}

class SVGCE extends SVGNSE { // Scalable Vector Graphics Circle Element
    constructor([r, cx, cy], options) {
        cx = cx ?? r;
        cy = cy ?? cx;
        super("circle", options);
        if (r != null) {
            this.setAttribute("r", r);
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
        }
    }
}


class SVGE extends SVGNSE { // Scalable Vector Graphics Element
    static #count = 0;
    static get id() { return `SVGE${this.#count++}` }
    
    constructor([w, h], options) {
        w = w ?? options?.parse?.getAttribute("width");
        h = h ?? options?.parse?.getAttribute("height") ?? w;
        super("svg", options);
        if (w != null) {
            this.setAttribute("width", w);
            this.setAttribute("height", h);
            this.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
        this.#genMask(w, h, options ?? {});
    }
    
    #genMask(w, h, { fill, parse: donor }) {
        this.defs = new SVGNSE("defs", { parent: this.el });
        this.mask = new SVGNSE("mask", { id: `${SVGE.id}-mask`, parent: this.defs.el });
        this.main = new SVGRE([w, h], { id: "main", parent: this.el });
        this.main.setAttribute("mask", `url(#${this.mask.id})`);
        if (fill != null) { this.main.setAttribute("fill", fill) }
        if (donor != null) { this.maskFromDonor(donor) }
    }
    
    maskFromDonor(el) {
        el.querySelectorAll("*").forEach(shape => this.addToMask(shape));
    }
    
    addToMask(el) {
        if (el.id == null) {
            const bytes = new TextEncoder().encode(el.outerHTML);
            crypto.subtle.digest("SHA-256", bytes).then(hash => {
                const hashBytes = new Uint8Array(hash);
                const sum = [...hashBytes].reduce((sum, add) => sum + add, 0);
                const randArr = times => [...Array(times)].map(() => Math.random() * sum);
                const randVal = times => Math.trunc(randArr(times).reduce((sum, add) => sum + add, 0) / times);
                const id = hashBytes.toHex() + randVal(825);
                el.setAttribute("id", `id${id}`);
            });
        }
        AF.holdUntill(30, () => el.id != null, () => {
            const use = new SVGUE(`#${el.id}`, { cn: el.getAttribute("class") });
            use.setAttribute("style", "filter: opacity(0%)");
            use.appendTo(this.el);
            this.mask.appendChild(el.el ?? el);
        });
    }
}

/* sVg namespace Element */


export default class VE { // sVg namespace Element

    constructor(name, options={}) {
        const { id, cn, fromString: data, parse: donor, parent } = options;
        const xmlns = "http://www.w3.org/2000/svg";
        this.el = data == null
            ? document.createElementNS(xmlns, name)
            : new DOMParser().parseFromString(data, "image/svg+xml").querySelector(name);
        this.raw = data ?? this.el.outerHTML;
        if (id != null) this.setAttribute("id", id);
        if (cn != null) this.classList.add(cn);
        if (donor != null) this.cloneChildren(donor);
        if (parent != null) this.appendTo(parent);
    }
    
    get id() { return this.el.getAttribute("id") }
    get className() { return this.el.className }
    get classList() { return this.el.classList }
    get children() { return this.el.children }
    
    setAttributes(...pairs) { pairs.forEach(pair => this.el.setAttribute(...pair)) }
    setAttribute(attr, value) { this.el.setAttribute(attr, value) }
    getAttribute(attr) { return this.el.getAttribute(attr) }
    
    appendChild(el) { this.el.appendChild(el) }
    appendTo(el) { el.appendChild(this.el) }
    remove() { this.el.remove() }
    
    cloneChildren(el) {
        [...el.children].forEach(childEl => this.el.appendChild(childEl.cloneNode(true)));
    }
}


export class VUE extends VE { // sVg Use Element

    constructor(id, options) {
        super("use", options);
        this.setAttribute("href", id);
    }
}


export class VPE extends VE { // sVg Path Element

    constructor(d, options) {
        super("path", options);
        this.setAttribute("d", d);
    }
    
    setPath(d) { this.setAttribute("d", d) }
}


export class VRE extends VE { // sVg Rect Element

    constructor([w, h], options={}) {
        h = h ?? w;
        super("rect", options);
        if (w != null) {
            this.setAttribute("width", w);
            this.setAttribute("height", h);
        }
        const {x, y} = options;
        if (x != null) this.setAttribute("x", x);
        if (y != null) this.setAttribute("y", y);
    }
}


export class VCE extends VE { // sVg Circle Element

    constructor(r, options={}) {
        super("circle", options);
        const { x, y } = options;
        const cx = x ?? r;
        const cy = y ?? cx;
        //console.debug({r,x,y});
        if (r != null) {
            this.setAttribute("r", r);
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
        }
    }
}


export class VSE extends VE { // sVg Svg Element

    static #count = 0;
    static get id() { return `VSE${this.#count++}` }
    
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
        this.defs = new VE("defs", { parent: this.el });
        this.mask = new VE("mask", { id: `${VSE.id}-mask`, parent: this.defs.el });
        this.fill = new VRE([w, h], { parent: this.el });
        this.fill.setAttribute("mask", `url(#${this.mask.id})`);
        if (fill != null) this.fill.setAttribute("fill", fill);
        if (donor != null) this.maskFromDonor(donor);
    }
    
    maskFromDonor(el) {
        [...el.childNodes].forEach(shape => this.addToMask(shape));
    }
    
    addToMask(el) {
        const id = el.getAttribute("id");
        const use = new VUE(`#${id}`, { cn: el.className });
        use.setAttribute("style", "filter: opacity(0)");
        use.appendTo(this.el);
        this.mask.appendChild(el.el ?? el);
    }
}

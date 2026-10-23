/* sVg namespace Element */

import IG from "./IG.mjs";


export default class VE { // sVg namespace Element

    constructor(name, options={}) {
        const { id, cn, fromString: data, parse: donor, parent } = options;
        const xmlns = "http://www.w3.org/2000/svg";
        this.el = data == null
            ? document.createElementNS(xmlns, name)
            : new DOMParser().parseFromString(data, "image/svg+xml").querySelector(name);
        this.raw = data ?? this.el.outerHTML;
        if (id != null) this.setAttribute("id", id);
        if (cn != null) this.setAttribute("class", cn);
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
    
    set d(d) { this.setAttribute("d", d) }
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
        if (r != null) {
            this.setAttribute("r", r);
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
        }
    }
}


export class VSE extends VE { // sVg Svg Element
    
    constructor([w, h], options={}) {
        const { parse } = options;
        w = w ?? parse?.getAttribute("width");
        h = h ?? parse?.getAttribute("height") ?? w;
        super("svg", options);
        if (!this.id) IG.add(this.el, "VSE");
        if (w != null) {
            this.setAttribute("width", w);
            this.setAttribute("height", h);
            this.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
        this.#genMask(w, h, options ?? {}, parse?.cloneNode(true));
    }
    
    #genMask(w, h, { fill }, donor) {
        this.defs = new VE("defs", { parent: this.el });
        this.mask = new VE("mask", { id: `${this.id}-mask`, parent: this.defs.el });
        this.fill = new VRE([w, h], { parent: this.el });
        this.fill.setAttribute("mask", `url(#${this.mask.id})`);
        this.fill.setAttribute("fill", fill ?? "currentColor");
        if (donor == null) return;
        const donorDefs = donor.querySelector("defs");
        if (donorDefs != null) {
            [...donorDefs.childNodes].forEach(child => {
                this.defs.appendChild(child);
            });
            donorDefs.remove();
        }
        this.maskFromDonor(donor);
    }
    
    maskFromDonor(el) {
        [...el.childNodes].forEach(shape => {
            shape.setAttribute("fill", "#fff");
            this.addToMask(shape);
        });
    }
    
    addToMask(el) {
        const id = el.getAttribute("id") ?? IG.add(el, this.mask.id);
        const cn = el.getAttribute("class");
        const use = new VUE(`#${id}`, { cn });
        use.setAttribute("style", "filter: opacity(0)");
        use.appendTo(this.el);
        this.mask.appendChild(el.el ?? el);
    }
}

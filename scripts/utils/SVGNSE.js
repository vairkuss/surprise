class SVGNSE { // Scalable Vector Graphics Name Space Element
    constructor(elName, options) {
        const { id, cn, fromString: data, parent } = options ?? {};
        const xmlns = "http://www.w3.org/2000/svg";
        this.raw = data;
        this.el = data == null
            ? document.createElementNS(xmlns, elName)
            : new DOMParser().parseFromString(data, "image/svg+xml").querySelector(elName);
        if (id != null) { this.setAttribute("id", id) }
        if (cn != null) { this.addClass(cn) }
        if (parent != null) { this.appendTo(parent) }
    }
    
    get id() {
        return this.el.getAttribute("id");
    }
    
    get className() {
        return this.el.getAttribute("class");
    }
    
    setAttribute(attr, value) {
        this.el.setAttribute(attr, value);
    }
    
    getAttribute(attr) {
        return this.el.getAttribute(attr);
    }
    
    addClass(newClassName) {
        if (this.className?.includes(newClassName)) { return }
        const updatedClassName = (this.className ?? "").split(" ").concat([newClassName]).join(" ");
        this.setAttribute("class", updatedClassName);
    }
    
    removeClass(classToRemove) {
        const updatedClassName = (this.className ?? "").split(" ").filter(cn => cn !== classToRemove).join(" ");
        this.setAttribute("class", updatedClassName);
    }
    
    appendChild(el) {
        this.el.appendChild(el);
    }
    
    appendTo(el) {
        el.appendChild(this.el);
    }
    
    remove() {
        this.el.remove();
    }
}


class SVGE extends SVGNSE { // Scalable Vector Graphics Element
    constructor([w, h], options) {
        h = h ?? w;
        super("svg", options);
        if (w != null) {
            this.setAttribute("width", w);
            this.setAttribute("height", h);
            this.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
    }
}

class SVGPE extends SVGNSE { // Scalable Vector Graphics Path Element
    constructor(d, options) {
        super("path", options);
        this.setAttribute("d", d ?? "");
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

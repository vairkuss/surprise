class SVGNSE { // Scalable Vector Graphics Name Space Element
    constructor(elName, options) {
        const { id, cn } = options ?? {};
        const xmlns = "http://www.w3.org/2000/svg";
        this.el = document.createElementNS(xmlns, elName);
        if (id != null) { this.setAttribute("id", id) }
        if (cn != null) { this.addClass(cn) }
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
    constructor(dimensions, options) {
        let [w, h] = dimensions ?? []
        h = h ?? w;
        super("svg", options);
        this.setAttribute("width", w);
        this.setAttribute("height", h);
        this.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }
    
    static fromString(data) {
        const svge = new SVGE();
        svge.el = new DOMParser().parseFromString(data, "image/svg+xml").querySelector("svg");
        return svge;
    }
}

class SVGPE extends SVGNSE { // Scalable Vector Graphics Path Element
    constructor(d, options) {
        super("path", options);
        this.setAttribute("d", d);
    }
}

class SVGCE extends SVGNSE { // Scalable Vector Graphics Circle Element
    constructor(params, options) {
        let [r, cx, cy] = params ?? []
        cx = cx ?? cy ?? r;
        cy = cy ?? cx;
        super("path", options);
        this.setAttribute("r", r);
        this.setAttribute("cx", cx);
        this.setAttribute("cy", cy);
    }
}

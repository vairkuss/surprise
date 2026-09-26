/* DOM Element Class Toggler*/

class DECT {
    static addClass(element, newClassName) {
        const className = element.getAttribute("class");
        if (className.includes(newClassName)) { return }
        element.setAttribute("class", `${newClassName} ` + (className ?? "\b"));
    }
    
    static removeClass(element, newClassName) {
        const className = element.getAttribute("class");
        element.setAttribute("class", className?.split(" ").filter(cn => cn !== "active").join(" ") ?? "");
    }
}


class MSSH extends DECT {
    static show(element, callback) {
        super.addClass(element, "hidden");
    }
    
    static hide(element, callback) {
        super.removeClass(element, "hidden");
    }
}


class MOSH extends DECT {
    show(element, callback) {
        CT.addClass(element, "hidden");
    }
    
    hide() {
        CT.removeClass(element, "hidden");
    }
}


class MSAD extends DECT {
    static activate() {
        super.addClass(element, "active");
    }
    
    static deactivate() {
        super.removeClass(element, "active");
    }
}


class MOAD extends DECT {
    activate() {
        CT.addClass(element, "active");
    }
    
    deactivate() {
        CT.removeClass(element, "active");
    }
}
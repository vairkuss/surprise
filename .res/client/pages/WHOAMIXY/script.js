/* WHOAMIXY */


class Presentation {
    
    static init() {
        console.log("WHOAMIXY inited")
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => Presentation.init());
} else Presentation.init();

/* Particle Processor */

import PG from "./PG.mjs";


class PP { // Particle Processor
    
    static init() {
        console.log("PP inited");
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => PP.init());
} else PP.init();

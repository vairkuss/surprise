/* Particle Generator */


class PG { // Particle Generator
    
static init() {
        console.log("PG inited");
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => PG.init());
} else PG.init();

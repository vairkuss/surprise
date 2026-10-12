/* Music Player */

import PM from "./PM.mjs"


class MP { // Music Player
    
    static init() {
        console.log("MP inited");
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => MP.init());
} else MP.init();

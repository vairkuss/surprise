import Board from "./BEAST/B.mjs"


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => Board.init());
} else Board.init();

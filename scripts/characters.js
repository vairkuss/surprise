document.querySelectorAll(".character").forEach(
    el => {
        el.addEventListener("pointerenter", () => {
            el.src = await fetch(`http://localhost:7142/random_sprite?meta=${el.id}:active`);
        });
        el.addEventListener("pointerleave", () => {
            el.src = await fetch(`http://localhost:7142/random_sprite?meta=${el.id}:idle`);
        });
    }
}
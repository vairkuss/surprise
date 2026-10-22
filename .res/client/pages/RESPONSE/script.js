/* RESPONSE */


class Response {
    
    static init() {
        const span = document.querySelector("#code");
        const code = span.textContent;
        if (code == 503) {
            const navigation = document.querySelector("#navigation");
            navigation.style.display = "none";
        }
    }
}


if (window.data == null) {
    if (window.pending == null) window.pending = [];
    window.pending.push(() => Response.init());
} else Response.init();

/* Request Responder */


const MIME_TYPES = {
    default: "application/octet-stream",
    txt: "text/plain; charset=utf-8",
    csv: "text/plain; charset=utf-8",
    html: "text/html; charset=utf-8",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    mp3: "audio/mp3",
    mp4: "video/mp4",
    ttf: "font/ttf"
}


class RR { // Request Responder
    
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    
    recieve() {
        let body = "";
        let ready;
        this.req.on("data", data => body += data);
        this.req.on("end", () => ready = 1);
        return new Promise(res => {
            setInterval(() => { if (ready) res(body) }, 1000 * 1 / 30);
        });
    }
    
    sendFile({ data, type, code }) {
        const time = Date.now().toLocaleTimeString("en-GB");
        console.log(`$ [${time}] <${code}> ${this.req.method} "${type}": ${this.req.url}`);
        this.res.writeHead(code, { "Content-Type": MIME_TYPES[type] ?? MIME_TYPES.default });
        this.res.end(data);
    }

    sendObj(obj) {
        const data = JSON.stringify(obj);
        this.sendFile({ data, type: "json", code: 200 });
    }

    sendText(data) { this.sendFile({ data, type: "txt", code: 200}) }
    
    end() { this.sendText("") }
}

/* Request Responder */


const MIME_TYPES = {
    default: "application/octet-stream",
    txt: "text/plain; charset=utf-8",
    csv: "text/plain; charset=utf-8",
    html: "text/html; charset=utf-8",
    css: "text/css",
    js: "text/javascript",
    mjs: "text/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    mp3: "audio/mp3",
    mp4: "video/mp4",
    ttf: "font/ttf"
}


export default class RR { // Request Responder
    
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    
    sendFile({ data, ext, code }) {
        const timestamp = Date.now();
        const logTime = new Date(timestamp).toLocaleTimeString("en-GB");
        const method = this.req.method.padStart(4);
        const given = ext.padStart(4);
        console.log(`$ [${logTime}] <${code}> ${method} ${given}: ${this.req.url}`);
        this.res.writeHead(code, { "Content-Type": MIME_TYPES[ext] ?? MIME_TYPES.default });
        this.res.end(data);
    }

    sendObj(obj) {
        const data = JSON.stringify(obj);
        this.sendFile({ data, ext: "json", code: 200 });
    }

    sendText(data) {
        this.sendFile({ data, ext: "txt", code: 200});
    }
    
    end() {
        this.sendText('');
    }
    
    sendLog({ pathname, args, caller }) {
        const timestamp = Date.now();
        const logTime = new Date(timestamp).toLocaleTimeString("en-GB");
        const text = Array.from(args).join("\n$\t");
        console.debug(`\n$ [${logTime}] <LOG> ${pathname}\n${caller}:`);
        for (const arg of args) {
            console.debug("$\t", arg);
        }
        console.log();
        this.res.statusCode = 200;
        this.res.end();
    }
}

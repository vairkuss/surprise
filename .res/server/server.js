/* Surprise Server */

import http from "http";

import DS from "./storage.mjs";
import FL from "./loader.mjs";
import RR from "./sender.mjs";


if (process.argv.length < 3) {
    console.error("$ Host and port not specified");
} else if (process.argv.length < 4) {
    console.error("$ Port not specified");
}
if (process.argv.length < 4) process.exit();
const [ HOST, PORT ] = process.argv.slice(2);
const CWD = process.cwd();
const fl = new FL(CWD);


const SERVER = http.createServer(async (req, res) => {
    const rr = new RR(req, res);
    const notFound = function() {
        const file = fl.response(404);
        rr.sendFile(file);
    }
    let body = "";
    
    switch(req.url) {
        case "/favicon.ico":
            rr.end();
        break;
            
        case "/":
        case "/25285":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("INFILAXY"));
        break;
        
        case "/presentation":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("WHOAMIXY"));
        break;
        
        case "/collection":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("SHELFAXY"));
        break;
        
        case "/proposition":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("BEASTAXY"));
        break;
        
        case "/4eRn1j_kW@dr4T":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("BL4CKSQR"));
        break;
            
        case "/preview":
            if (req.method !== "GET") return notFound();
            rr.sendFile(fl.html("preview"));
        break;
        
        
        case "/get/beast":
            if (req.method !== "GET") return notFound();
            rr.sendObj(DS.beast);
        break;
            
        case "/post/data":
            if (req.method !== "POST") return notFound();
            req.on("data", data => body += data);
            req.on("end", () => {
                const page = body;
                const data = DS.gather(page);
                rr.sendObj(data);
            });
        break;
        
        case "/post/save":
            if (req.method !== "POST") return notFound();
            req.on("data", data => body += data);
            req.on("end", () => {
                const save = JSON.parse(body);
                DS.writeSave(save);
                rr.end();
            });
        break;
            
        // case "/post/log":
        //     if (req.method !== "POST") return notFound();
        //     req.on("data", data => body += data);
        //     req.on("end", () => {
        //         const data = JSON.parse(body);
        //         rr.sendLog(data);
        //     });
        // break;
        
        
        case "/shutdown":
            const timestamp = Date.now();
            const closingTime = new Date(timestamp).toLocaleTimeString("ru-RU");
            rr.sendFile(fl.response(503));
            setTimeout(() => {
                console.info(`\n$ [${closingTime}] Server shutdown`); 
                process.exit();
            }, 1200);
        break;
            
        default:
            if (req.method !== "GET") return notFound();
            const href = req.url.slice(1);
            rr.sendFile(fl.file(href));
        break;
    }
});


DS.load(fl);
SERVER.listen(PORT, () => {
    const timestamp = Date.now();
    const launchingTime = new Date(timestamp).toLocaleTimeString("ru-RU");
    console.log(`\n$ [${launchingTime}] Server listening`);
});

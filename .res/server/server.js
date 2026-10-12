/* Surprise Server */

import DS from "./DS.mjs";
import FL from "./FL.mjs";
import RR from "./RR.mjs";

import http from "http";
import path from "path";
import url from "url";
import fs from "fs";


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
    const adr = new URL(req.url, `http://${HOST}:${PORT}`);
    const meta = adr.searchParams;
    const rr = new RR(req, res, adr.pathname);
    const notFound = function() {
        const file = fl.response(404);
        rr.sendFile(file);
    }
    let body = "";
    
    switch(adr.pathname) {
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
        
        
        case "/get/data":
            const absentKeys = ["page", "chars"].some(key => meta.get(key) == null);
            if (req.method !== "GET" || absentKeys) return notFound();
            const [page, chars] = meta.values();
            const data = DS.gather(page, chars);
            rr.sendObj(data);
        break;
        
        case "/post/data":
            if (req.method !== "POST") return notFound();
            req.on("data", data => body += data);
            req.on("end", () => {
                const data = JSON.parse(body);
                DS.writeSave(data.save);
                DS.data.transition = data.transition;
                rr.end();
            });
        break;
        
        
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
            const href = adr.pathname.slice(1);
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

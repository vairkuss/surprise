/* Surprise Server */

import { FL, fs } from "FL.js";
import { RR } from "RR.js";

const http = require("http");
const path = require("path");
const { URL } = require("url");


if (process.argv.length < 3) console.error("$ Host and port not specified");
else if (process.argv.length < 4) console.error("$ Port not specified");
if (process.argv.length < 4) process.exit();
const [ HOST, PORT ] = process.argv.slice(2);
const CWD = process.cwd();
const fl = new FL(CWD);


class SM { // Save Manager
    
    static #path = path.join("data", "save.json");
    static #save = {
        stage: 0,
        cursor: {},
        music: { id: null, time: 0 },
        playlists: {},
        score: { highest: [0, 0, 0], best: 0 },
        pause: 1
    }
    
    static get save() {
        return JSON.parse(JSON.stringify(this.#save));
    }
    
    static write(values) {
        Object.apply(this.#save, values);
        fs.writeFile(this.#path, JSON.stringify(this.#save), "utf-8");
    }
    
    static load() {
        fl.txt(this.#path).then(({ data }) => {
            Object.apply(this.#save, JSON.parse(data));
            this.write({ pause: 1 });
        });
    }
}


class DB { // Data Bank

    static async load() {
        this.mdata = await fl.txt(path.join("data", "mdata.csv")).then(({ data }) => data);
        this.grads = await fl.txt(path.join("data", "grads.svg")).then(({ data }) => data);
        this.dialogues = await fl.json(path.join("data", "dialogues.json"));
        this.#loadSprites();
        this.#loadIcons();
        this.#loadBeast();
    }
    
    static async #loadSprites() {
        const rootPath = path.join("imgs", "chars");
        const root = await fl.folder(rootPath).then(({ data }) => data);
        this.sprites = root.reduce(async (sprites, char) => {
            const collectionPath = path.join(rootPath, char);
            const collection = await fl.folder(collectionPath).then(({ data }) => data);
            collection.forEach(async folder => {
                sprites[char][folder] = fs.readdirSync(path.join("imgs", "chars", char, folder)).map(async sprite => {
                    return await fl.file(path.join("imgs", "chars", char, folder, sprite)).then(({ data }) => data));
                });
            });
            return sprites;
        }, {});
    }
    
    static async #loadIcons() {
        const called = folder => path.join("icons", folder);
        const named = await fl.folder(called("named")).then(({ data }) => data);
        const random = await fl.folder(called("random")).then(({ data }) => data);
        this.icons = {
            named: named.reduce(async (named, icon) => {
                named[icon] = await fl.txt(path.join(toNamed, icon)).then(({ data }) => data);
                return named;
            }), {}),
            random: random.map(async icon => {
                return await fl.txt(path.join(toRandom, icon)).then(({ data }) => data);
            })
        }
    }
    
    static async #loadBeast() {
        const beastPath = path.join("imgs", "BEAST");
        const collections = await fl.folder(beastPath).then(({ data }) => data);
        this.beast = collections.reduce(async (beast, collection) => {
            const collectionPath = path.join(beastPath, collection);
            const sets = await fl.folder(collectionPath).then(({ data }) => data);
            beast[collection] = sets.reduce(async (collection, set) => {
                const setPath = path.join(collectionPath, set);
                const sprites = await fl.folder(setPath).then(({ data }) => data);
                collection[set] = sprites.map(async sprite => {
                    const spritePath = path.join(setPath, sprite);
                    return await fl.file(spritePath).then(({ data }) => data);
                });
                return collection;
            }, {})
            return beast;
        }, {});
    }
    
    static burp(save, { page, chars }) {
        const clone = JSON.parse(JSON.stringify(this));
        delete clone.dialogues;
        if (page !== "BEASTAXY") delete clone.beast;
        Object.assign(clone, {
            save,
            replicas: this.dialogues[`${page}:${this.save.stage}`],
            sprites: chars.reduce((sprites, char) => {
                sprites[char] = this.sprites[char];
                return sprites;
            }, {})
        });
        return clone;
    }
}


const SERVER = http.createServer(async (req, res) => {
    const adr = new URL(req.url, `http://${HOST}:${PORT}`);
    const meta = adr.searchParams;
    const rr = new RR(req, res);
    const notFound = () => fl.response(404).then(file => rr.sendFile(file));
    
    switch(adr.pathname) {
        case "/favicon.ico":
            rr.end();
            break;
            
        case "/":
        case "/25285":
            if (req.method !== "GET") return notFound();
            fl.html("INFILAXY").then(file => rr.sendFile(file));
            break;
        
        case "/presentation":
            if (req.method !== "GET") return notFound();
            fl.html("ABOUTAXY").then(file => rr.sendFile(file));
            break;
        
        case "/collection":
            if (req.method !== "GET") return notFound();
            fl.html("SHELFAXY").then(file => rr.sendFile(file));
            break;
        
        case "/proposition":
            if (req.method !== "GET") return notFound();
            fl.html("BEASTAXY").then(file => rr.sendFile(file));
            break;
        
        case "/4eRn1j_kW@dr4T":
            if (req.method !== "GET") return notFound();
            fl.html("BL4CKSQR").then(file => rr.sendFile(file));
            break;
            
        case "/preview":
            if (req.method !== "GET") return notFound();
            fl.html("preview").then(file => rr.sendFile(file));
            break;
        
        
        case "/get/data":
            if (req.method !== "GET") return notFound();
            rr.sendObj(DB.burp(SM.save, meta));
            break;
        
        case "/post/values":
            if (req.method !== "POST") return notFound();
            const raw = await rr.recieve();
            const values = JSON.parse(raw);
            SM.update(values);
            rr.end();
            break;
            
        case "/post/cursor":
            if (req.method !== "POST") return notFound();
            rr.recieve().then(cursor => SM.write({ cursor }));
            break;
        
        
        case "/shutdown":
            if (req.method !== "GET") return notFound();
            const closingTime = Date.now().toLocaleTimeString("en-GB");
            fs.response(503).then(file => rr.sendFile(file));
            setTimeout(() => {
                console.info(`\n$ [${closingTime}] Server shutdown\n`); 
                process.exit();
            }, 1200);
            break;
            
        default:
            const shouldEncode = [""];
            rr.loadFile(adr.pathname, contentType?.includes("; charset=utf-8") ?? 0)
            .then(file => rr.sendRes(res, file, contentType))
            .catch(e => {
                if (e.code === "ENOENT") {
                    send404(res, adr.href);
                } else {
                    send500(res, e);
                }
            });
            break;
    }
});


SM.load();
const launchingTime = Date.now().toLocaleTimeString("en-GB");
SERVER.listen(PORT, () => console.log(`\n$ [${launchingTime}] Server listening\n`));

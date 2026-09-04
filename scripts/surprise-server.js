const http = require("http");
const path = require("path");
const { promises: fs } = require("fs");
const { URL } = require("url");
const PROJECT_ROOT = path.dirname(__dirname);


class SM {
    
    static #savePath = path.join(PROJECT_ROOT, "res", "databases", "save.json");
    static #initialised = 0;
    static variables = {};
    
    static async update(values) {
        console.log("began to update");
        const newEntries = Object.keys(values).filter(
            key => !Object.keys(this.variables).includes(key)
        );
        if (newKeys.length) {
            throw new Error([
                `SM.update Error`,
                `\tprovided keys: ${Object.keys(values)}`,
                `\tunrecognised keys: ${newEntries}`
            ].join("\n"));
        }
        console.debug("changing: " + JSON.stringify(values))
        console.debug("before: " + JSON.stringify(this.variables))
        Object.assign(
            this.variables,
            ...values.keys()
            .map((key) => JSON.parse(`{${key}: ${values[key]}}`))
        );
        console.debug("after: "+JSON.stringify(this.variables))
        fs.writeFile(this.#savePath, JSON.stringify(this.variables), "utf-8");
        console.log("ended updating");
    }
    
    static async init() {
        if (this.#initialised) { return }
        let save = await fs.readFile(this.#savePath, "utf-8")
        .then(data => JSON.parse(data))
        .catch(e => {
            if (e.code === "ENOENT") { return {} }
            console.error(`> Ошибка инициализации SM:\n${e}`);
            process.exit();
        });
        this.variables = {
            s: 0,
            c: 0,
            i: -1,
            t: 0,
            p: null,
            h: 0,
            b: 0,
            ...Object.keys(this.variables)
            .filter(key => "sitphbp".includes(key))
            .reduce((obj, key) => {
                obj[key] = this.variables[key];
                return obj;
            }, {}),
            p: 1
        }
        fs.writeFile(this.#savePath, JSON.stringify(this.variables), "utf-8");
        this.#initialised = 1;
    }
}


function send404(res, url) {
    console.error(`> Ресурс не найден: ${url}`);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>404: Ресурс "http://localhost:7148${url}" не найден!</h1>`);
}

function send500(res, e) {
    console.error(e);
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>500: Ошибка на сервере: "${e.code}"</h1>`);
}

function send200(res, data=null, type=null) {
    res.writeHead(200, { "Content-Type": type ?? "text/html; charset=utf-8" });
    res.end(data ?? '<h1><a href="/25285">Вернуться на главную страницу</a></h1>');
}

function sendText(res, text) {
    send200(res, text, "text/plain; charset=utf-8");
}

function sendPage(res, page) {
    send200(res, page);
}

function sendJson(res, obj) {
    send200(res, JSON.stringify(obj), "application/json; charset=utf-8");
}

function loadFile(res, url, utf8=0) {
    return new Promise(
        async (resolve, reject) => {
            try {
                const data = await fs.readFile(path.join(PROJECT_ROOT, url));
                resolve(utf8 ? data.toString("utf-8") : data);
            } catch (e) {
                reject(e);
            }
        }
    );
}

function loadPage(res, name) {
    return loadFile(res, path.join("pages", name), "utf-8");
}


const server = http.createServer(async (req, res) => {
    const adr = new URL(req.url, "http://localhost:7148");
    const meta = adr.searchParams;
    switch(adr.pathname) {
        
        case "/favicon.ico":
            send200(res);
            break;
            
        
        case "/":
        case "/25285":
            if (req.method === "GET") {
                loadPage(res, "index.html")
                .then(page => sendPage(res, page));
            }
            break;
        /**/
        case "/preview":
            if (req.method === "GET") {
                loadPage(res, path.join("dev", "buttons_preview.html"))
                .then(page => sendPage(res, page));
            }
            break;
        /**/
        case "/herosnake":
            if (req.method === "GET") {
                loadPage(res, "snake.html")
                .then(page => sendPage(res, page));
            }
            break;
        
        case "/shelf":
            if (req.method === "GET") {
                loadPage(res, "shelf.html")
                .then(page => sendPage(res, page));
            }
            break;
        
        case "/quickbrownfoxjumpsoverthelazydog":
            if (req.method === "GET") {
                loadPage(res, "arg.html")
                .then(page => sendPage(res, page));
            }
            break;
        
        
        case "/get/variables":
            if (req.method === "GET") {
                sendJson(res, SM.variables);
            }
            break;
        
        case "/get/mcolor": //обрабатывать фулл mdata в будущем
            if (req.method === "GET") {
                return await loadFile(res, path.join("res", "databases", "mdata.json"))
                .then(mdata => sendJson(res, JSON.parse(mdata)[SM.variables.i]?.hsl ?? [0, 0, 80]));
            }
            break;
        
        case "/get/common_styles":
            if (req.method === "GET") {
                if (meta.toString()) {
                    send404(res, adr.href);
                    return;
                }
                fs.readdir(path.join(PROJECT_ROOT, "styles", "common"))
                .then(styles => sendJson(res, styles));
            }
            break;
            
        case "/get/classes":
            if (req.method === "GET") {
                if (meta.toString()) {
                    send404(res, adr.href);
                    return;
                }
                fs.readdir(path.join(PROJECT_ROOT, "scripts", "classes"))
                .then(classes => sendJson(res, classes));
            }
            break;
            
        case "/get/character_random_sprite":
            if (req.method === "GET") {
                if (meta.size !== 1) { 
                    send404(res, adr.href);
                    return;
                }
                const [char, state] = [...meta.entries()][0];
                const folder = path.join("res", "images", "characters", char, state);
                
                fs.readdir(path.join(PROJECT_ROOT, folder))
                .then(sprites => {
                    if (sprites) {
                        const randSprite = sprites[Math.trunc(Math.random() * sprites.length)];
                        sendText(res, path.join(folder, randSprite));
                    } else {
                        send404(res, path.join(folder, "*"));
                    }
                })
                .catch(e => {
                    if (e.code === "ENOENT") {
                        send404(res, adr.href);
                    } else {
                        send500(res, e);
                    }
                });
            }
            break;
        
        
        case "/get/replicas":
            if (req.method === "GET") {
                if (meta.keys().some(key => !"pct".includes(key)) && meta.keys().length !== 3) {
                    send404(res, adr.href);
                    return;
                }
                const { p: page, c: character, t: cursor } = meta;
            }
            break;
        
        
        case "/set":
            if (!meta.keys().length) {
                send404(res, adr.href);
                return;
            }
            await SM.update(meta.entries())
            .catch(e => {
                send500(res, e);
                return;
            });
            send200(res);
            break;
        
        
        case "/close":
            console.log("\n\n$ Сервер завершил свою работу"); 
            fs.readFile(path.join(PROJECT_ROOT, "pages", "server", "shutdown.html"), "utf-8")
            .then((shutdownPage) => sendPage(res, shutdownPage));
            setTimeout(() => { process.exit() }, 1200);
            break;
            
        default:
            let contentType = null;
            switch (path.extname(adr.pathname)) {
                case ".css": contentType = "text/css; charset=utf-8"; break;
                case ".js": contentType = "application/javascript; charset=utf-8"; break;
                case ".json": contentType = "application/json; charset=utf-8"; break;
                case ".png": contentType = "image/png"; break;
                case ".svg": contentType = "image/svg+xml; charset=utf-8"; break;
                case ".mp3": contentType = "audio/mp3"; break;
                case ".ttf": contentType = "font/ttf"; break;
            }
            
            loadFile(res, adr.pathname, contentType?.includes("; charset=utf-8") ?? 0)
            .then(file => send200(res, file, contentType))
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

SM.init()
.then(() => server.listen(7148))
.then(() => console.log("\n\n$ Сервер запустился на http://localhost:7148/25285"));

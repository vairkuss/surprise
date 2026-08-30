const http = require("http");
const path = require("path");
const { promises: fs } = require("fs");
const { URL: Url } = require("url");
const PROJECT_ROOT = path.dirname(__dirname);

const server = http.createServer(async (req, res) => {
    switch(req.url.split("?")[0]) {
        
        case "/":
            if (req.method === "GET") {
                const page = await fs.readFile(path.join(PROJECT_ROOT, "pages", "index.html"), "utf-8")
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                res.end(page);
            }
            break;
        
        case "/preview":
            if (req.method === "GET") {
                const page = await fs.readFile(path.join(PROJECT_ROOT, "pages", "buttons_preview.html"), "utf-8");
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                res.end(page);
            }
            break;
        
        case "/common_styles":
            if (req.method === "GET") {
                const folder = path.join(PROJECT_ROOT, "styles", "common");
                const styles = await fs.dirread(folder);
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(styles));
            }
            
        case "/character_random_sprite":
            if (req.method === "GET") {
                const addr = new Url(req.url, "http://localhost:7142");
                const [char, state] = addr.searchParams.get("meta").split(":");
                const folder = path.join(PROJECT_ROOT, "res", "images", "characters", char, state);
                const sprites = await fs.dirread(folder);
                const randomSprite = sprites[Math.trunc(Math.random() * sprites.length)];
                res.writeHead(200, {
                    "Content-Type": "text/plain; charset=utf-8"
                });
                res.end(path.join(folder, randomSprite));
            }
        
        case "/close":
            console.log("> Сервер самостоятельно завершил свою работу\n"); 
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });
            res.end("<h1>Сервер был выключен!</h1>");
            process.exit()
            break;
            
        default:
            const filePath = path.join(PROJECT_ROOT, req.url.split("?")[0]);
            
            const ext = path.extname(filePath);
            let contentType = "text/html; charset=utf-8";
            switch (ext) {
                case ".css": contentType = "text/css; charset=utf-8"; break;
                case ".js": contentType = "application/javascript; charset=utf-8"; break;
                case ".json": contentType = "application/json"; break;
                case ".png": contentType = "image/png"; break;
                case ".svg": contentType = "image/svg+xml; charset=utf-8"; break;
                case ".mp3": contentType = "audio/mp3"; break;
            }
            
            fs.readFile(filePath, (err, file) => {
                if (err) {
                    res.writeHead(404, { "Content-Type": contentType });
                    res.end(`<h1>Страница "http://localhost:7142${req.url}" не найдена!</h1>`);
                    return;
                }
                if (contentType.includes("; charset=utf-8")) { file = file.toString("utf-8") }
                res.writeHead(200, { "Content-Type": contentType });
                res.end(file);
            });
            break;
    }
});

server.listen(7142, () => console.log("\n\n> Сервер запустился на http://localhost:7142/"));
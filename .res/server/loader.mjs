/* File Loader */

import path from "path";
import fs from "fs";


export default class FL { // File Loader
    
    constructor(cwd) {
        this.cwd = cwd;
    }
    
    #styles(title) {
        const link = href => `<link rel="stylesheet" href="${href}" />`;
        const commonPath = path.join("client", "styles");
        const common = this.folder(commonPath).reduce((styles, ctl) => {
            return styles + link(`client/styles/${ctl}`);
        }, '');
        const pagePath = path.join("client", "pages", title, "styles");
        const page = this.folder(pagePath).reduce((styles, ctl) => {
            return styles + link(`client/pages/${title}/styles/${ctl}`);
        }, '');
        return common + page;
    }
    
    #scripts() {
        const script = src => `<script type="module" src="${src}"></script>`;
        const scriptsPath = path.join("client", "modules");
        return this.folder(scriptsPath).reduce((scripts, ctl) => {
            return scripts + script(`client/modules/${ctl}/${ctl}.js`); 
        }, '');
    }
    
    #defs() {
        const defsPath = path.join("local", "data", "defs.svg");
        return this.txt(defsPath);
    }
    
    #collection() {
        const collectionPath = path.join("local", "data", "collection.csv");
        const collection = this.txt(collectionPath).split("\r\n");
        const li = text => `<li>${text}</li>`;
        const items = collection.reduce((items, ent) => items + li(ent), '');
        return `<ol id="collection">${items}</ol>`;
    }

    checkPath(href) {
        if (!fs.existsSync(href)) return 404;
        if (!path.resolve(href).startsWith(this.cwd)) return 403;
    }
    
    folder(href, options) {
        const code = this.checkPath(href);
        if (code != null) return [`${code}`];
        return fs.readdirSync(href, options);
    }

    file(href) {
        const code = this.checkPath(href);
        if (code != null) return this.response(code);
        const data = fs.readFileSync(href)
        const ext = path.extname(href).slice(1);
        return { data, ext, code: 200 };
    }
    
    utf8(href) {
        const file = this.file(href);
        if (file.code !== 200) return file;
        file.data = file.data.toString("utf-8");
        return file;
    }
    
    txt(href) {
        const file = this.utf8(href);
        return file.code === 200 ? file.data : '';
    }
    
    json(href) {
        const data = this.txt(href);
        if (!data) return null;
        return JSON.parse(data);
    }

    html(title) {
        const contentPath = path.join("client", "pages", title, "page");
        const content = this.utf8(contentPath);
        if (content.code !== 200) return content;
        const pagePath = path.join("client", "framework", "page.html");
        const file = this.utf8(pagePath);
        file.data = file.data
        .split('styles go here').join(this.#styles(title))
        .split('NOSERVER').join(title)
        .split('content goes here').join(content.data)
        .split('scripts go here').join(this.#scripts())
        .split('defs go here').join(this.#defs())
        .split('collection goes here').join(this.#collection());
        return file;
    }
    
    response(code) {
        const message = {
            403: "Доступ запрещён",
            404: "Ресурс не найден",
            500: "Ошибка сервера",
            503: "Отключение сервера",
            default: "Ответ сервера"
        }
        const page = this.html("RESPONSE");
        page.data = page.data
        .split("CODE").join(code)
        .split("MESSAGE").join(message[code] ?? message.default);
        page.code = code;
        return page;
    }
}

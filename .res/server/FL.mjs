/* File Loader */

import path from "path";
import fs from "fs";


export default class FL { // File Loader
    
    constructor(cwd) {
        this.cwd = cwd;
    }

    checkPath(href) {
        if (!fs.existsSync(href)) return 404;
        if (!path.resolve(href).startsWith(this.cwd)) return 403;
    }
    
    folder(href, options) {
        const code = this.checkPath(href);
        if (code != null) return code;
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
        .split('Запустите "START.py", чтобы начать интерракцию').join(content.data)
        .split('scripts go here').join(this.#scripts());
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
    
    #styles(title) {
        const link = href => `<link rel="stylesheet" href="${href}" />`;
        const stylesPath = path.join("client", "pages", title, "styles");
        return this.folder(stylesPath).reduce((styles, ctl) => {
            return styles + link(`client/pages/${title}/styles/${ctl}`);
        }, '');
    }
    
    #scripts() {
        const script = src => `<script type="module" src="${src}"></script>`;
        const scriptsPath = path.join("client", "modules");
        return this.folder(scriptsPath).reduce((scripts, ctl) => {
            return scripts + script(`client/modules/${ctl}/${ctl}.js`); 
        }, '');
    }
}

/* File Loader */

const { promises: fs } = require("fs");


class FL { // File Loader
    
    constructor(cwd) {
        this.cwd = cwd;
    }

    checkPath(href) {
        if (!fs.existsSync(href)) return 404;
        if (!path.resolve(href).startsWith(this.cwd)) return 403;
    }
    
    async folder(href) {
        const code = this.checkPath(href);
        if (code != null) return await this.response(code);
        const data = JSON.stringify(fs.readdirSync(href));
        return { data, ext: "json", code: 200 };
    }

    async file(href) {
        const code = this.checkPath(href);
        if (code != null) return await this.response(href, code);
        return await fs.readFile(href).then(data => {
            const ext = path.extname(href).slice(1);
            return { data, ext, code: 200 };
        });
    }
    
    async response(code) {
        const fillingPath = path.join("content", "server", `${code}`);
        const newCode = this.checkPath(fillingPath);
        if (newCode != null) return await this.response(newCode);
        const fillingNotation = await fs.readFile(fillingPath, "utf-8");
        const { title, content } = JSON.parse(contentNotation);
        const file = await this.html("RESPONSE");
        file.data = file.data
        .split("RESPONSE").join(title)
        .split("Server says...").join(content);
        Object.assign(file, { code });
        return file;
    }
    
    async txt(href) {
        return await this.file(href).then(file => {
            if (file.code !== 200) return file;
            return file.data.toString("utf-8");
        });
    }
    
    async json(href) {
        return await this.txt(href).then(({ data }) => {
            return JSON.parse(data.toString("utf-8"));
        });
    }

    async html(title) {
        const searchResult = this.content(title);
        if (searchResult.code !== 200) return searchResult;
        const content = searchResult.data.toString("utf-8");
        return await this.txt(path.join("data", "page.html")).then(file => {
            file.data = file.data
            .split('<i>styles go here</i>').split(this.styles(title))
            .split('NOSERVER').join(title)
            .split('Запустите "START.py", чтобы начать интерракцию').join(content)
            .split('<i>scripts go here</i>').join(this.scripts());
            return file;
        });
    }
    
    at(folder, title) {
        const pathToTitle = path.join(folder, title);
        const pathToBasic = path.join(folder, "INFILAXY");
        const exists = fs.existsSync(pathToTitle);
        return exists ? pathToTitle : pathToBasic;
    }
    
    styles(title) {
        const link = href => `<link rel="stylesheet" href="${href}" />`;
        return fs.readdirSync(this.at("styles", title)).reduce((styles, ctl) => {
            return styles + link(`styles/${title}/${ctl}`);
        }, "");
    }
    
    content(title) {
        return await this.file(this.at("content", title)).then(file => {
            if (file.code !== 200) return file;
            file.data = file.data.toString("utf-8"));
            return file;
        });
    }
    
    scripts() {
        const script = src => `<script src="${src}"></script>`;
        const scriptsPath = path.join("scripts", "common");
        return fs.readdirSync(commonPath).reduce((scripts, ctl) => {
            return scripts + script(`scripts/common/${ctl}/${ctl}.js`); 
        }, "");
    }
}

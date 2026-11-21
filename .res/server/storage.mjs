/* Data Storage */

import path from "path";
import fs from "fs";


class NC { // Node Collection
    
    #hrefToKeys(href) {
        const { name, dir } = path.parse(href);
        const keys = dir.split(path.sep).filter(Boolean);
        return { keys, name };
    }
    
    constructor(href, data) {
        if (!href) return;
        const { keys, name } = this.#hrefToKeys(href);
        if (name) {
            const extlessName = name.replace(/\..*/, '');
            keys.push(extlessName);
        }
        const [key, ...rest] = keys;
        this[key] = rest.length
            ? new NC(rest.join(path.sep), data)
            : data;
    }
    
    append(href, data) {
        const { keys, name } = this.#hrefToKeys(href);
        if (name) {
            const extlessName = name.replace(/\..*/, '');
            keys.push(extlessName); 
        }
        const [key, ...rest] = keys;
        if (!rest.length) {
            this[key] = data;
        } else if (this[key] instanceof NC) {
            this[key].append(rest.join(path.sep), data);
        } else {
            this[key] = new NC(rest.join(path.sep), data);
        }
    }
    
    get(href) {
        const { keys, name } = this.#hrefToKeys(href);
        if (typeof name === "string") {
            const extlessName = name.replace(/\..*/, '');
            keys.push(extlessName); 
        }
        return keys.reduce((folder, key) => folder?.[key], this);
    }
}


export default class DS { // Data Storage
    
    static #filePaths(href) {
        const ents = this.fl.folder(href, { recursive: true, withFileTypes: true });
        const files = ents.filter(ent => !ent.isDirectory());
        return files.map(ent => path.join(ent.parentPath, ent.name));
    }
    
    static #loadRoot(dir, func) {
        const hrefs = this.#filePaths(dir);
        const root = hrefs.reduce((root, href) => {
            const data = !func ? href.replace(/\\/g, '/') : func(href);
            root.append(href, data);
            return root;
        }, new NC());
        return root.get(dir);
    }
    
    static #savePath = path.join("local", "data", "save.json");
    
    static #loadSave() {
        this.save = {
            stage: 0,
            history: {},
            playlists: {},
            highest: [],
            best: 0
        }
        if (fs.existsSync(this.#savePath)) {
            const local = this.fl.json(this.#savePath);
            Object.apply(this.save, local);
        }
        this.writeSave();
    }
    
    static writeSave(save) {
        if (save) {
            this.save = save;
        }
        const data = JSON.stringify(this.save);
        fs.writeFileSync(this.#savePath, data, "utf-8");
    }
    
    static #loadDialogues() {
        const dialoguesPath = path.join("local", "data", "dialogues.json");
        this.dialogues = this.fl.json(dialoguesPath);
    }
    
    static #loadIcons() {
        const icons = folder => path.join("local", "icons", folder);
        const named = this.fl.folder(icons("named"));
        const random = this.fl.folder(icons("random"));
        this.icons = {
            named: named.reduce((named, icon) => {
                const iconPath = path.join(icons("named"), icon);
                const parts = icon.split(".");
                const name = parts.length < 2 ? icon : parts.slice(0, -1).join("-");
                named[name] = this.fl.txt(iconPath);
                return named;
            }, {}),
            random: random.map(icon => {
                const iconPath = path.join(icons("random"), icon);
                return this.fl.txt(iconPath);
            })
        }
    }
    
    static #loadImgs() {
        const imgs = folder => path.join("local", "imgs", folder);
        this.beast = {
            ui: this.#loadRoot(imgs("ui")),
            cinematics: this.#loadRoot(imgs("cinematics")),
            canvas: this.#loadRoot(imgs("canvas"), href => this.fl.txt(href))
        }
        this.sprites = this.#loadRoot(imgs("chars"));
    }

    static load(fl) {
        this.fl = fl;
        this.#loadSave();
        this.#loadDialogues();
        this.#loadIcons();
        this.#loadImgs();
    }
    
    static gather(pageTitle) {
        const data = {}
        const page = this.fl.html(pageTitle)
        if (page.code === 200) {
            data.save = this.save;
            data.icons = this.icons;
            const replicas = this.dialogues[`${pageTitle}:${this.save.stage}`];
            data.replicas = JSON.stringify(replicas);
            const charRegex = /<div id="(.*?)" class="character">/g;
            const chars = [...page.data.matchAll(charRegex)].map(x => x[1]) ?? [];
            console.debug(chars)
            const sprites = chars.reduce((sprites, char) => {
                sprites[char] = this.sprites[char];
                return sprites;
            }, {});
            data.sprites = JSON.stringify(sprites);
        }
        return data;
    }
}

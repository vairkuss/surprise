/* Data Storage */

import path from "path";
import fs from "fs";


class NC { // Node Collection
    
    #hrefToKeys(href) {
        const { name, dir } = path.parse(href);
        const raw = dir.split(path.sep).concat([name]);
        return raw.filter(x => x);
    }
    
    constructor(href, data) {
        if (href == null || !href.length) return;
        const keys = this.#hrefToKeys(href);
        const primal = keys.shift();
        const last = keys.pop();
        if (last != null) {
            const name = last.replace(/\.(.*)/, '');
            keys.push(name);
        }
        this[primal] = keys.toReversed().reduce((prev, key) => {
            return new NC(key, prev);
        }, data);
    }
    
    append(href, data) {
        const keys = this.#hrefToKeys(href);
        const last = keys.pop();
        if (last != null) {
            const name = last.replace(/\.(.*)/, '');
            keys.push(name); 
        }
        const key = keys.shift();
        const child = keys.join(path.sep);
        if (!keys.length) {
            this[key] = data;
        } else if (key in this) {
            this[key].append(child, data);
        } else {
            this[key] = new NC(child, data);
        }
    }
    
    get(href) {
        const keys = this.#hrefToKeys(href);
        const last = keys.pop();
        if (last != null) {
            const name = last.replace(/\.(.*)/, '');
            keys.push(name); 
        }
        return keys.reduce((folder, key) => folder[key] ?? {}, this);
    }
}


export default class DS { // Data Storage
    
    static #filePaths(href) {
        const ents = this.fl.folder(href, { recursive: true, withFileTypes: true });
        const files = ents.filter(ent => !ent.isDirectory());
        return files.map(ent => path.join(ent.parentPath, ent.name));
    }
    
    static #loadRoot(dir, process) {
        const hrefs = this.#filePaths(dir);
        const root = hrefs.reduce((root, href) => {
            const data = process != null ? process(href) : href;
            root.append(href, data);
            return root;
        }, new NC());
        return root.get(dir);
    }
    
    static #savePath = path.join("local", "data", "save.json");
    
    static #loadSave() {
        this.data.save = {
            stage: 0,
            history: {},
            playlists: {},
            highest: [],
            best: 0
        }
        if (fs.existsSync(this.#savePath)) {
            const local = this.fl.json(this.#savePath);
            Object.apply(this.data.save, local);
        }
        this.writeSave();
    }
    
    static writeSave(save) {
        if (save != null) {
            this.data.save = save;
        }
        const data = JSON.stringify(this.data.save);
        fs.writeFileSync(this.#savePath, data, "utf-8");
    }
    
    static #loadDialogues() {
        const dialoguesPath = path.join("local", "data", "dialogues.json");
        this.data.dialogues = this.fl.json(dialoguesPath);
    }
    
    static #loadIcons() {
        const icons = folder => path.join("local", "icons", folder);
        const named = this.fl.folder(icons("named"));
        const random = this.fl.folder(icons("random"));
        this.data.icons = {
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
        this.data.beast = {};
        this.data.beast.canvas = this.#loadRoot(imgs("canvas"), href => this.fl.txt(href));
        this.data.beast.ui = this.#loadRoot(imgs("ui"));
        this.data.sprites = this.#loadRoot(imgs("chars"));
    }

    static load(fl) {
        this.fl = fl;
        this.data = {};
        this.#loadSave();
        this.#loadDialogues();
        this.#loadIcons();
        this.#loadImgs();
    }
    
    static gather(page, chars) {
        if (page == null || chars == null) return {};
        const clone = JSON.parse(JSON.stringify(this.data));
        delete clone.dialogues;
        if (page !== "BEASTAXY") delete clone.beast;
        const replicas = this.data.dialogues[`${page}:${this.data.save.stage}`];
        clone.replicas = JSON.stringify(replicas);
        const sprites = JSON.parse(chars).reduce((sprites, char) => {
            sprites[char] = this.data.sprites[char];
            return sprites;
        }, {});
        clone.sprites = JSON.stringify(sprites);
        const timestamp = Date.now();
        const gatheredAt = new Date(timestamp).toLocaleTimeString("ru-RU");
        console.info(`$ [${gatheredAt}] <LOG> STORAGE: gathered data for "${page}"`);
        return clone;
    }
}

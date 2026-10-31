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
        if (name != null) {
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

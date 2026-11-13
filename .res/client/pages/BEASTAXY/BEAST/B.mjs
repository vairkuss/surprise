/* Board */

import M from "./M.mjs";
import AB from "./AB.mjs";
import { Side } from "./DF.mjs";
import ES from "./E.mjs";
import A from "./A.mjs";
import S, { DP } from "./S.mjs";
import T from "./T.mjs";


class BT extends T { // Border Tile
    
    draw(meta, gridSize, danger) {
        [
            !this.y,
            this.x + 1 === gridSize[0],
            this.y + 1 === gridSize[1],
            !this.x
        ].forEach((term, dir) => {
            if (term && !danger.includes(dir)) {
                super.draw(meta,
                    new Side("#fff", this.cords, dir, 0.2)
                );
            }
        });
    }
}


export default class B { // Board

    static paused = true;
    
    static stats = document.getElementById("stats");
    static timeText = document.getElementById("time").firstChild;
    static scoreText = document.getElementById("score").firstChild;
    
    static canvas = document.querySelector("#board > canvas");
    static ctx = this.canvas.getContext("2d");
    static fps = 60;
    static bpm = 240;
    static tileSize = 25;
    
    static get gridW() { return Math.ceil(this.canvas.width / this.tileSize) }
    static get gridH() { return Math.ceil(this.canvas.height / this.tileSize) }
    static get gridSize() { return [this.gridW, this.gridH] }
    
    static get grid() {
        const tiles = [];
        for (let y = 0; y < this.gridH; y++) {
            for (let x = 0; x < this.gridW; x++) {
                tiles.push([x, y]);
            }
        }
        return tiles;
    }

    static get outerTiles() {
        const edges = [];
        for (let x = 0; x < this.gridW; x++) {
            edges.push([x, 0], [x, this.gridH - 1]);
        }
        for (let y = 1; y + 1 < this.gridH; y++) {
            edges.push([0, y], [this.gridW - 1, y]);
        }
        return edges;
    }

    static get freeTile() {
        const tail = this.snake.tail.map(seg => seg.cords);
        const axis = this.snake.dir.findIndex(Boolean);
        const line = Array.from({ length: this.gridSize[axis] }, (_, i) => {
            return this.snake.cords.map((v, j) => j === axis ? i : v);
        });
        const unallowed = tail.concat(line);
        
        const allowed = this.grid.filter(cords => {
            return unallowed.every(bad => cords.toString() !== bad.toString());
        });
        return allowed.length
            ? allowed[Math.trunc(Math.random() * allowed.length)]
            : line[Math.trunc(Math.random() * line.length)];
    }
    
    static spawnApple(cords) {
        this.apple = new A(cords ?? this.freeTile);
    }
    
    static gameStart() {
        clearInterval(this.gameInterval);
        clearInterval(this.drawInterval);

        this.paused = false;
        this.pausedTime = 0;
        this.inputQueue = [];
        this.gameStarted = new Date();
        this.scoreText.nodeValue = "0";
        
        const mid = this.gridSize.map(v => Math.trunc(v / 2));
        this.spawnApple(mid);
        
        const offset = Math.trunc(this.gridH / 2) * Math.trunc(Math.random() * 2);
        const randHalfY = Math.trunc(Math.random() * (this.gridH / 2 - 2) + 1);
        const randY = offset + randHalfY;
        this.snake = new S([-1, randY], [1, 0]);
        this.enemies = [];
        
        this.staminaAB.disable(5);
        this.stats.removeAttribute("class");
        this.drawInterval = setInterval(() => this.draw(), 1000 / this.fps);
        this.gameInterval = setInterval(() => this.update(), 60 * 1000 / (this.bpm * 2));
    }
    
    static drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#886b66";
        this.grid.forEach(([x, y]) => {
            if (x % 2 === y % 2) {
                this.ctx.fillRect(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        });
    }
    
    static isDeathTile(cords) {
        const deathTiles = this.snake.tail.slice(0, -1);
        this.enemies?.forEach(enemy => deathTiles.push(enemy));
        return deathTiles.some(tile => {
            return cords.toString() === tile.cords.toString();
        });
    }
    
    static draw() {
        const meta = [this.ctx, this.tileSize];
        this.drawGrid();        
        this.outerTiles.forEach(cords => {
            const danger = [];
            for (let i = 0; i < 4; i++) {
                const nbour = cords.map((v, j) => {
                    return v + Math.trunc(Math.sin((i - j) / 2 * Math.PI));
                });
                const inBounds = nbour.every((v, i) => 0 <= v && v < this.gridSize[i]);
                if (inBounds) continue;
                const nbourTwin = nbour.map((v, i) => {
                    return (v + this.gridSize[i]) % this.gridSize[i];
                })
                const shadows = this.snake.tail.concat(this.snake).concat(this.enemies);
                if (shadows.map(shadow => `${shadow.cords}`).includes(`${nbourTwin}`)) {
                    danger.push(i);
                }
            }
            new BT(cords).draw(meta, this.gridSize, danger);
        });
        
        if (this.apple.cords.some((v, i) => v >= this.gridSize[i])) {
            this.spawnApple();
        }
        this.apple.draw(meta);
        this.snake.draw(meta);
        const dpCords = this.snake.next(this.gridSize, S.dashDist);
        new DP(dpCords, this.isDeathTile(dpCords), this.staminaAB.interval).draw(meta);
        this.enemies.forEach(enemy => enemy.draw(meta));
        
        this.lastDraw = this.currentDraw ?? this.gameStarted;
        this.currentDraw = new Date();
        if (this.paused) {
            this.pausedTime += this.currentDraw - this.lastDraw;
        } else {
            const elapsed = this.currentDraw - this.gameStarted + this.pausedTime;
            const iso = new Date(elapsed).toISOString();
            this.timeText.nodeValue = iso.match(/\d{2}:\d{2}\.\d{3}/) ?? "error";
        }
    }
    
    static dash() {
        if (this.staminaAB.interval != null) {
            this.snake.dashing = true;
            this.staminaAB.disable();
        }
    }
    
    
    static addInput(input) {
        if (this.paused) return;
        const max = this.inputQueue.length >= 4;
        const lastDir = this.inputQueue.length
            ? this.inputQueue.at(-1)
            : this.snake.dir;
        const backturner = `${lastDir.map(v => -v)}` === `${input}`;
        if (this.paused || backturner || max) return;
        this.inputQueue.push(input);
    }
    
    static async swipe(start) {
        const end = await new Promise(res => {
            document.body.addEventListener("pointerup", e => {
                res([e.offsetX, e.offsetY]);
            }, { capture: 1, once: 1 });
        });
        const vector = end.map((v, i) => v - start[i]);
        const SENSITIVITY = 30;
        if (vector.some(v => Math.abs(v) > SENSITIVITY)) {
            const dir = Math.abs(vector[0]) > Math.abs(vector[1])
                ? [Math.sign(vector[0]), 0]
                : [0, Math.sign(vector[1])];
            this.addInput(dir);
        }
    }
    
    static keyboardInput(input) {
        switch(input) {
            case "ArrowRight":
            case "KeyD":
                this.addInput([1, 0]);
            break;
            
            case "ArrowDown":
            case "KeyS":
                this.addInput([0, 1]);
            break;
            
            case "ArrowLeft":
            case "KeyA":
                this.addInput([-1, 0]);
            break;
            
            case "ArrowUp":
            case "KeyW":
                this.addInput([0, -1]);
            break;
            
            case "ShiftLeft":
            case "Space":
                this.addInput(this.snake.dir);
            break;
        }
    }
    
    static update() {
        if (this.paused) return;

        if (this.growTimes) {
            this.growTimes--;
            this.add();
        };

        this.enemies.forEach(enemy => enemy.move());
        this.enemies = this.enemies.filter(enemy => {
            return enemy.cords.every((v, i) => {
                return 0 <= v && v < this.gridSize[i];
            });
        });
        
        if (this.inputQueue.length) {
            const lastDir = this.snake.dir;
            this.snake.dir = this.inputQueue.shift();
            const repeated = `${lastDir}` === `${this.snake.dir}`;
            const prerepeated = `${this.inputQueue[0]}` === `${this.snake.dir}`;
            if (repeated || prerepeated) this.dash();
            if (prerepeated) this.inputQueue.shift();
        }
        
        const snakeNext = this.snake.next(this.gridSize);
        if (this.isDeathTile(snakeNext)) this.gameOver();
        
        const grow = `${snakeNext}` === `${this.apple.cords}`;
        if (grow) {
            this.apple.active = true;
            this.snake.tail.unshift(this.apple);
            this.scoreText.nodeValue = this.snake.score;
            this.spawnApple();
        }
        this.snake.tail.toReversed().forEach((seg, i, a) => {
            seg.cords = i + 1 < a.length ? a[i + 1].cords : this.snake.cords;  
        });
        
        this.snake.cords = snakeNext;
        this.snake.dashing = false;

    }
    
    static gameOver() {
        clearInterval(this.gameInterval);
        clearInterval(this.drawInterval);
        
        this.stats.classList.add("hidden");
        this.staminaAB.disable(false);
        M.load("default", "GAME\u00A0OVER", "gameover");
    }
    
    static pause() {
        this.paused = !this.paused
        if (this.paused) {
            M.load("default", "PAUSE", "pause");
        }
    }
    static add() {
        this.apple.cords = this.snake.next(this.gridSize);
    }
    
    static init() {
        new ResizeObserver(ents => {
            ents.forEach(ent => {
                if (ent.borderBoxSize) return;
                const { inlineSize, blockSize } = ent.borderBoxSize[0];
                ent.target.width = inlineSize;
                ent.target.height = blockSize;
            });
        }).observe(this.canvas, { box: "border-box" });
        signal.addEventListener("bPause", () => this.pause());
        signal.addEventListener("bRestart", () => this.gameStart());
        signal.addEventListener("bKill", () => this.gameOver());
        signal.addEventListener("bAdd", () => this.add());
        body.addEventListener("pointerdown", e => this.swipe([e.offsetX, e.offsetY]));
        body.addEventListener("keydown", e => {
            if (e.repeat) return;
            this.keyboardInput(e.code);
        });
        this.staminaAB = new AB("stamina", () => this.dash(), 10, 1.2);

        window.snakeGrow = count => {
            this.growTimes = count;
        }
    }
}

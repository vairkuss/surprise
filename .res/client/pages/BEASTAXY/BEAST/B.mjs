/* Board */

import AB from "./AB.mjs";
import { Side } from "./DF.mjs";
import ES from "./E.mjs";
import A from "./A.mjs";
import S, { DP } from "./S.mjs";
import T from "./T.mjs";


class BT extends T { // Border Tile
    
    draw(meta, gridSize, danger) {
        const dir = [
            !this.y,
            this.x + 1 === gridSize[0],
            this.y + 1 === gridSize[1],
            !this.x
        ].findIndex((term, i) => term && !danger.includes(i));
        super.draw(meta,
            new Side("#fff", this.cords, dir, 0.2)
        );
    }
}


export default class B { // Board
    
    static scoreText = document.getElementById("score").appendChild(new Text());
    
    static canvas = document.getElementById("board");
    static ctx = this.canvas.getContext("2d");
    static fps = 60;
    static bpm = 240;
    static tileSize = 20;
    
    static get canvasRect() { return this.canvas.getBoundingClientRect() }
    static get gridWidth() { return Math.ceil(this.canvasRect.width / this.tileSize) }
    static get gridHeight() { return Math.ceil(this.canvasRect.height / this.tileSize) }
    static get gridSize() { return [this.gridWidth, this.gridHeight] }
    
    static get grid() {
        const tiles = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                tiles.push([x, y]);
            }
        }
        return tiles;
    }

    static get outerTiles() {
        const edges = [];
        for (let x = 0; x < this.gridWidth; x++) {
            edges.push([x, 0], [x, this.gridHeight - 1]);
        }
        for (let y = 1; y + 1 < this.gridHeight; y++) {
            edges.push([0, y], [this.gridWidth - 1, y]);
        }
        return edges;
    }

    static get freeTile() {
        const tail = this.snake.tail.map(seg => seg.cords);
        const axis = this.snake.dir.findIndex(Boolean);
        const line = [];
        for (let i = 0; i < this.gridSize[axis]; i++) {
            const cords = this.snake.cords.map((v, j) => j === axis ? i : v);
            line.push(cords);
        }
        const unallowed = tail.concat(line);
        const allowed = this.grid.filter(cords => {
            return unallowed.every(bad => cords.toString() !== bad.toString());
        });
        return this.allowed.length
            ? allowed[Math.floor(Math.random() * allowed.length)]
            : unall;
    }
    
    static spawnApple(cords) {
        this.apple = new A(cords ?? this.freeTile);
    }
    
    static gameStart() {
        this.playing = 1;
        this.paused = 0;
        clearInterval(this.gameInterval);
        clearInterval(this.drawInterval);
        
        this.inputQueue = [];
        this.scoreText.nodeValue = "0";
        
        const randY = Math.trunc(Math.random() * (this.gridHeight - 2)) + 1;
        this.snake = new S([-1, randY], [1, 0]);
        const mid = this.gridSize.map(v => Math.trunc(v / 2))
        this.spawnApple(mid);
        this.enemies = [];
        
        this.drawInterval = setInterval(() => this.draw(), 1000 / this.fps);
        this.gameInterval = setInterval(() => {
            if (!this.paused) this.update();
        }, 60 * 1000 / (this.bpm * 2));
    }
    
    static drawGrid() {
        this.ctx.fillStyle = "#bb9994";
        this.ctx.fillRect(0, 0, this.canvasRect.width, this.canvasRect.height);
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
        return deathTiles.some(deathTile => {
            return cords.toString() === deathTile.cords.toString();
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
                if (this.isDeathTile(nbourTwin)) {
                    danger.push(i);
                }
            }
            new BT(cords).draw(meta, this.gridSize, danger);
        });
        
        if (this.apple.cords.some((v, i) => v % this.gridSize[i] <= 0)) {
            delete this.apple;
            this.spawnApple();
        }
        this.apple.draw(meta);
        this.snake.draw(meta);
        const dpCords = this.snake.next(this.gridSize, S.dashDist);
        new DP(dpCords, this.isDeathTile(dpCords)).draw(meta);
        this.enemies.forEach(enemy => enemy.draw(meta));
    }
    
    static dash() {
        if (this.staminaAB.interval != null) {
            this.snake.dashing = true;
            this.staminaAB.disable();
        }
    }
    
    
    static addInput(input) {
        const MAX_INPUTS = 4;
        const backturner = (this.inputQueue.length
            ? this.inputQueue.slice(-1)[0]
            : this.snake.dir
        ).map(v => -v).toString() === input.toString()
        if (this.paused || backturner) return;
        this.inputQueue.splice(MAX_INPUTS);
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
    
    static update () {
        this.enemies.forEach(enemy => enemy.move());
        this.enemies = this.enemies.filter(enemy => {
            return enemy.cords.every((v, i) => {
                return 0 <= v && v < this.gridSize[i];
            });
        });
        
        if (this.inputQueue.length) {
            const lastDir = this.snake.dir;
            this.snake.dir = this.inputQueue.shift();
            const repeat = `${lastDir}` === `${this.snake.dir}`;
            const pre = `${this.inputQueue[0]}` === `${this.snake.dir}`;
            console.log({lastDir: `${lastDir}`, snake: `${this.snake.dir}`, next: `${this.inputQueue[0]}`, repeat,pre})
            if (repeat || pre) this.dash();
        }
        
        const snakeNext = this.snake.next(this.gridSize);
        if (`${snakeNext}` === `${this.apple.cords}`) {
            this.apple.appendTo(this.snake.tail);
            this.spawnApple();
            this.scoreText.nodeValue = this.snake.score;
        }
        
        if (this.isDeathTile(snakeNext)) {
            this.gameOver();
        }
        
        this.snake.move(this.gridSize);
        if (this.snake.dashing) { this.snake.dashing = 0 };
    }
    
    static gameOver() {
        this.paused = 1;
        clearInterval(this.gameInterval);
        clearInterval(this.drawInterval);
        this.staminaAB.disable(false);
        
        this.ctx.strokeStyle = "#710";
        this.ctx.fillStyle = "#f21";
        this.ctx.lineWidth = 2;
        const text = "GAME OVER";
        this.ctx.strokeText(text,
            (this.gridWidth - text.length) / 2 * this.tileSize,
            (this.gridHeight + 0.5) / 2 * this.tileSize
        );
        this.ctx.fillText(text,
            (this.gridWidth - text.length) / 2 * this.tileSize,
            (this.gridHeight + 0.5) / 2 * this.tileSize
        );
    }
    
    static #pause() { this.paused = !this.paused }
    static #dash() { this.addInput(this.snake.dir) }
    
    static init() {
        this.ctx.font = `${this.tileSize * 2}px infex`;
        signal.addEventListener("bPause", () => this.#pause());
        signal.addEventListener("bRestart", () => this.gameStart());
        signal.addEventListener("bKill", () => this.gameOver());
        body.addEventListener("pointerdown", e => this.swipe([e.offsetX, e.offsetY]));
        body.addEventListener("keydown", e => this.keyboardInput(e.code))
        this.staminaAB = new AB("stamina", () => this.#dash(), 10, 1.2, 5);
        this.gameStart();
    }
}

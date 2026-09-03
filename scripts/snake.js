class DF {
    
    static NULL () {};
    
    static rect (ctx, tileSize, x, y, sizeX, sizeY, fill) {
        return function () {
            let args = [
                (x + (1 - sizeX) / 2) * tileSize,
                (y + (1 - sizeY) / 2) * tileSize,
                sizeX * tileSize,
                sizeY * tileSize
            ];
            if (fill) {ctx.fillRect(...args)} else {ctx.strokeRect(...args)}
        }
    }
    
    static square (ctx, tileSize, x, y, size, fill) {
        return this.rect(ctx, tileSize, x, y, size, size, fill);
    }
    
    static tile (ctx, tileSize, x, y, fill) {
        return this.square(ctx, tileSize, x, y, 1, fill);
    }
    
    static circle (ctx, tileSize, x, y, d, fill) {
        return function () {
            ctx.beginPath();
            ctx.arc(
                (x + 0.5) * tileSize,
                (y + 0.5) * tileSize,
                d / 2 * tileSize,
                0,
                Math.PI * 2
            );
            if (fill) {ctx.fill()} else {ctx.stroke()}
        }
    }
    
    static side (ctx, tileSize, x, y, w, direction) {
        return function () {
            let corners = [...Array(4)].map(
                (_, i) => [x, y].map(
                    (v, j) => Math.trunc((i - j + 1) / 2) % 2
                        ? (v + 1) * tileSize //- w / 2
                        : v * tileSize //+ w / 2
                )
            );
            ctx.beginPath();
            ctx.moveTo(...corners[direction]);
            ctx.lineTo(...corners[(direction + 1) % 4]);
            ctx.stroke();
            //console.log(`[${corners[direction]}], [${corners[(direction + 1) % 4]}]`);
        }
    }
}


class Tile {
    
    constructor (x, y, color="#000", borderWidth=0, borderColor=null, fill=1) {
        this.x = x;
        this.y = y;
        this.cords = () => [this.x, this.y];
        this.area = (gridSize) => [...Array(3 * 3)].map((v, i) => [
            this.x - (i % 3) + 1,
            this.y - Math.trunc(i / 3) + 1
        ])
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor === null ? color : borderColor;
        this.fill = fill;
    }
    
    draw(ctx, fillFunction, strokeFunction, color=null, borderColor=null, borderWidth=null) {
        if (this.fill) {
            ctx.fillStyle = color === null ? this.color : color;
            fillFunction();
        }
        ctx.lineWidth = borderWidth === null ? this.borderWidth : borderWidth;
        ctx.strokeStyle = borderColor === null ? this.borderColor : borderColor;
        strokeFunction();
        ctx.lineWidth = 0;
    }
}


class DashPreviewTile extends Tile {
    
    constructor(x, y, danger) {
        let color = danger ? "#f00" : "#0ff";
        super(x, y, color);
    }
    
    draw (ctx, tileSize) {
        super.draw(
            ctx,
            DF.tile(
                ctx,
                tileSize,
                this.x,
                this.y,
                1
            ),
            DF.NULL
        );
    }
}


class BorderTile extends Tile {
    
    constructor(x, y) {
        super(x, y, "#fff", 4);
    }
    
    draw (ctx, tileSize, gridSize, dangerDirections) {
        [
            !this.y,
            this.x + 1 === gridSize[0],
            this.y + 1 === gridSize[1],
            !this.x
        ]
            .forEach(
                (directionTerm, direction) => {
                    if (
                        directionTerm && !dangerDirections.some(
                            danDir => direction === danDir
                        )
                    ) {
                        super.draw(
                            ctx,
                            DF.NULL,
                            DF.side(ctx, tileSize, this.x, this.y, this.borderWidth, direction)
                        );
                    }
                }
            );
    }
}


class Apple extends Tile {
    
    constructor (x, y) {
        super(x, y, "#d53", 2, "#c32")
    }
    
    draw (ctx, tileSize) {
        super.draw(
            ctx,
            DF.circle(ctx, tileSize, this.x, this.y, 1, 1),
            DF.circle(ctx, tileSize, this.x, this.y, 1, 0)
        );
    }
}


class SnakeSegment extends Tile {
    
    constructor (x, y) {
        super(x, y, "#4a0");
    }
    
    draw (ctx, tileSize) {
        super.draw(
            ctx,
            DF.tile(ctx, tileSize, this.x, this.y, 1),
            DF.NULL
        );
    }
}


class SnakeHead extends Tile {
    
    static dashLength = 3;
    
    constructor (startX, startY, startDirection) {
        super(startX, startY, "#5f2", 5, "#af6");
        this.direction = startDirection;
        this.score = 0;
        this.dashing = 0;
        this.tail = [];
    }
    
    next (gridSize, step=undefined) {
        let distance = 
                    step !== undefined 
                        ? step
                    : this.dashing
                        ? SnakeHead.dashLength
                        : 1;
        return this.cords().map(
            (cord, i) => (
                cord + this.direction[i] * distance + gridSize[i]
            ) % gridSize[i]
        );
    }
    
    draw (ctx, tileSize) {
        //tail
        this.tail.toReversed()
            .forEach(
                segment => segment.draw(ctx, tileSize)
            );
        //head
        super.draw(
            ctx,
            DF.tile(ctx, tileSize, this.x, this.y, 1),
            DF.tile(ctx, tileSize, this.x, this.y, 0)
        );
    }
    
    move (gridSize) {
        if (this.score) {
            this.tail = [new SnakeSegment(this.x, this.y)]
                .concat(
                    this.tail.slice(0,  this.score - 1)
                );
        }
        [this.x, this.y] = this.next(gridSize);
    }
}


class Enemy extends Tile {
    
    constructor (startX, startY, tickTiming, color="#b00", borderWidth=0, borderColor=null, fill=1) {
        super(startX, startY, color, borderWidth, borderColor, fill);
        this.tickTiming = tickTiming;
    }
    
    move (gridSize) {
        [this.x, this.y] = this.next(gridSize);
    }
}


class StreamlinedEnemy extends Enemy {
    
    constructor (startX, startY, tickTiming, direction, color="#60f") {
        super(startX, startY, tickTiming, color);
        this.direction = direction;
        this.next = gridSize => this.cords().map(
            (v, i) => v + this.direction[i]
        );
    }
    
    bounce (gridSize) {
        [
            !this.x || this.x + 1 === gridSize[0],
            !this.y || this.y + 1 === gridSize[1]
        ].forEach(
            (v, i) => {
                if (v) { this.direction[i] *= -1 }
            }
        );
    }
}


class EnemySpawner {
    static pawn (startX, startY, direction) {
        return new StreamlinedEnemy(startX, startY, 2/4, direction);
    }
}


class Board {
    
    static staminaElement = document.querySelector("#stamina");
    static staminaCooldown = 1.2;
    static staminaAnimationFrameDuration = 0.1;
    static staminaAnimationFrames = 4;
    static staminaUse = s => {
        this.staminaCounter =  -s  * this.fps;
    }
    static staminaAnimation = () => {
        let endFrame = this.staminaAnimationFrames * this.staminaAnimationFrameDuration * this.fps;
        if (this.staminaCounter >= endFrame) {
            this.staminaCounter = 0;
        }
        this.staminaCounter++;
        this.staminaElement.src = `/res/images/gui/stamina/${Math.max(0, Math.ceil(this.staminaCounter / (this.staminaAnimationFrameDuration * this.fps)))}.png`;
    }
    
    static scoreElement = document.querySelector("#score");
    
    static canvas = document.querySelector("#board");
    static ctx = Board.canvas.getContext("2d");
    static fps = 60;
    static bpm = 240;
    static tileSize = 10;
    static changeTileSize (newTileSize) { this.tileSize = newTileSize }
    
    static canvasSize = () => this.canvas.getBoundingClientRect();
    static width = () => Math.ceil(this.canvasSize().width / this.tileSize);
    static height = () => Math.ceil(this.canvasSize().height / this.tileSize);
    static gridSize = () => [this.width(), this.height()];
    static grid = () => [...Array(this.width() * this.height())]
        .map(
            (x, i) => [
                Math.trunc(i / this.width()),
                i % this.width()
            ]
        );
    static outerTiles = () => {//
    console.log(this.width() - 2);
    return [
        [...Array(this.width() - 2)], //ошибка
        [...Array(this.height() - 2)]
    ].flatMap(
        (v, i, a) => v.flatMap(
            (_, j) => [
                [(j + 1) * (1 - i), (j + 1) * i],
                [
                    a[1 - i].length * i + (j + 1) * (1 - i) + i,
                    a[1 - i].length * (1 - i) + (j + 1) * i + (1 - i)
                ]
            ]
        )
    ).concat(
        [...Array(4)].map(
            (_, i) => [this.width(), this.height()].map(
                (v, j) => (v - 1) * (Math.trunc((i - j + 1) / 2) % 2)
            )
        )
    );
    }//
    static randomFreeTile () {
        let unallowed = this.snake.tail
            .map(seg => seg.cords())
            .concat(this.snake.area())
            .concat(this.apple !== undefined ? this.apple.area() : this.outerTiles());
        let allowed = this.grid()
            .filter(
                cords => !unallowed.some(
                    badCords => badCords.toString() === cords.toString()
                )
            );
        return allowed[Math.floor(Math.random() * allowed.length)];
    }
    
    static spawnApple() {
        this.apple = new Apple(...this.randomFreeTile());
    }
    
    static gameStart () {
        this.playing = 1;
        this.paused = 0;
        if (this.gameInterval) { clearInterval(this.gameInterval) }
        if (this.drawInterval) { clearInterval(this.drawInterval) }
        
        this.inputQueue = [];
        this.staminaUse(5);
        this.scoreElement.textContent = "0";
        
        this.snake = new SnakeHead(-1, Math.trunc(Math.random() * (this.height() - 2)) + 1, [1, 0]);
        this.spawnApple(...this.randomFreeTile());
        this.enemies = [];
        
        this.drawInterval = setInterval(
            () => this.draw(),
            Math.floor(1000 / this.fps)
        );
        this.gameInterval = setInterval(
            () => {
                if (!this.paused) {
                    this.update();
                }
            },
            Math.floor(60 * 1000 / (this.bpm * 2))
        );
    }
    
    static drawGrid () {
        this.ctx.fillStyle = "#bb9994";
        this.ctx.fillRect(0, 0, this.canvasSize().width, this.canvasSize().height);
        this.ctx.fillStyle = "#886b66";
        this.grid().forEach(
            ([x, y], i) => {
                if (x % 2 === y % 2) {
                    this.ctx.fillRect(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        );
    }
    
    static isDeathTile = cords => this.snake.tail
        .slice(0, -1)
        .concat(this.enemies)
        .some(
            deathTile => cords.toString() === deathTile.cords().toString()
        );
    
    static draw () {
        this.drawGrid();
        
        console.log(this.outerTiles().map(v => `[${v}]`));
        
        this.outerTiles().forEach(outerTileCords => {
            let directNeighbours = [...Array(4)].map(
                (_, i) => {
                    return {
                        direction: i,
                        cords: outerTileCords.map(
                            (v, j) => v + Math.trunc(Math.sin((i - j) * 0.5 * Math.PI))
                        )
                    }
                }
            );
            let outOfBoundsNeighbours = directNeighbours.filter(
                neighbour => neighbour.cords.some(
                    (v, i) => !(0 <= v && v < this.gridSize()[i])
                )
            )
            let loopNeighbours = outOfBoundsNeighbours.map(
                neighbour => {
                    return {
                        direction: neighbour.direction,
                        cords: neighbour.cords.map(
                            (v, i) => (v + this.gridSize()[i]) % this.gridSize()[i]
                        )
                    }
                }
            )
            let dangerDirections = loopNeighbours.map(
                twin => {
                    if (
                        this.snake.tail.some(
                            seg => twin.cords.toString() === seg.cords().toString()
                        )
                    ) {
                        return twin.direction;
                    }
                }
            ).filter(direction => direction !== undefined);
            /*
            console.log("Корды: [" + outerTileCords + "]");
            console.log("Соседи: " + directNeighbours.map(v => `[${v}]`));
            console.log("Иноагенты: " + outOfBoundsNeighbours.map(v => `[${v}]`));
            console.log("Притянутые за яйца: " + loopNeighbours.map(v => `[${v}]`));
            console.log("Опасные: " + dangerDirections.map(v => `[${v}]`));
           //*/
            new BorderTile(...outerTileCords).draw(this.ctx, this.tileSize, this.gridSize(), dangerDirections);
        });
        
        this.apple.draw(this.ctx, this.tileSize);
        this.snake.draw(this.ctx, this.tileSize);
        if (this.staminaCounter > 0) {
            let dashCords = this.snake.next(this.gridSize(), SnakeHead.dashLength);
            new DashPreviewTile(...dashCords, this.isDeathTile(dashCords)).draw(this.ctx, this.tileSize);
        }
        this.enemies.forEach(
            enemy => enemy.draw(this.ctx, this.tileSize)
        );
        
        if (!this.paused) { this.staminaAnimation() }
    }
    
    static dash() {
        if (this.staminaCounter > 0) {
            this.snake.dashing = 1;
            this.staminaUse(this.staminaCooldown);
        }
    }
    
    static maxSimultaneousInputs = 4;
    
    static addInput (input) {
        if (
            !this.paused
            &&
            !(
                (this.inputQueue.length
                    ? this.inputQueue.slice(-1)[0]
                    : this.snake.direction
                ).map(v => -v).toString() === input.toString()
            )
        ) {
            this.inputQueue.splice(this.maxSimultaneousInputs);
            this.inputQueue.push(input);
            //console.log(this.inputQueue.map(v => `[${v.toString()}]`).toString())
        }
    }
    
    static swipingSensivity = 30;
    
    static async swipe (startCords) {
        const endCords = await new Promise(resolve => {
            document.body.addEventListener("pointerup", e => { resolve([e.offsetX, e.offsetY]) }, { once: 1 });
        });
        const vector = startCords.map((v, i) => -v + endCords[i]);
        //console.log(...startCords, ...endCords);
        //console.log(...endCords);
        //console.log(...vector);
        if (vector.every(v => Math.abs(v) < this.swipingSensivity)) { /*console.log("маловато");*/ return }
        this.addInput(
            Math.abs(vector[0]) > Math.abs(vector[1])
                ? [vector[0] / Math.abs(vector[0]), 0]
                :  [0, vector[1] / Math.abs(vector[1])]
        );
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
                this.addInput(this.snake.direction);
                break;
        }
    }
    
    static update () {
        this.enemies.forEach(enemy => enemy.move());
        this.enemies = this.enemies
            .filter(
                enemy => enemy.cords().every(
                    (v, i) => 0 <= v < this.gridSize()[i]
                )
            )
        
        if (this.inputQueue.length) {
            let last_direction;
            [last_direction, this.snake.direction] = [this.snake.direction, this.inputQueue.shift()];
            if (
                (last_direction.toString() == this.snake.direction)
                ||
                (this.inputQueue.length && this.snake.direction.toString() === this.inputQueue[0].toString())
            ) {
                this.dash();
            }
        }
        
        let snakeNext = this.snake.next(this.gridSize());
        if (snakeNext.toString() === this.apple.cords().toString()) {
            this.snake.score++;
            this.spawnApple();
            this.scoreElement.textContent = `${this.snake.score}`;
        }
        
        if (this.isDeathTile(snakeNext)) {
            this.gameOver();
        }
        
        this.snake.move(this.gridSize());
        if (this.snake.dashing) { this.snake.dashing = 0 };
    }
    
    static pause () {
        this.paused = !this.paused;
    }
    
    static gameOver () {
        this.paused = 1;
        clearInterval(this.gameInterval);
        clearInterval(this.drawInterval);
        this.staminaElement.src = "/res/images/gui/stamina/0.png"
        
        this.ctx.strokeStyle = "#710";
        this.ctx.fillStyle = "#f21";
        this.ctx.lineWidth = 2;
        let gameOverText = "GAME OVER";
        this.ctx.strokeText(
            gameOverText,
            (this.width() - gameOverText.length) / 2 * this.tileSize,
            (this.height() + 0.5) / 2 * this.tileSize
        );
        this.ctx.fillText(
            gameOverText,
            (this.width() - gameOverText.length) / 2 * this.tileSize,
            (this.height() + 0.5) / 2 * this.tileSize
        );
    }
    
    static init () {
        this.ctx.font = `${this.tileSize}px infex`;
        document.body.addEventListener("pointerdown", e => { this.swipe([e.offsetX, e.offsetY]) });
        document.body.addEventListener("keydown", e => { this.keyboardInput(e.code) })
        //this.gameStart();
    }
}

Board.init();
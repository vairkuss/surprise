class B { // Board
    
    // load stamina frames
    static staminaElement = document.querySelector("#stamina");
    static staminaCooldown = 1.2;
    static staminaAnimationFrameDuration = 0.1;
    static staminaAnimationFrames = 4;
    static staminaUse(s) { this.staminaCounter =  -s  * this.fps }
    static staminaAnimation() {
        const framesPerSprite = this.staminaAnimationFrameDuration * this.fps;
        const endFrame = this.staminaAnimationFrames * framesPerSprite;
        this.staminaCounter %= endFrame;
        this.staminaCounter++;
        const frame = Math.ceil(this.staminaCounter / framesPerSprite);
        this.staminaElement.src = `res/images/gui/stamina/${Math.max(0, frame)}.png`;
    }
    
    static scoreElement = document.querySelector("#score");
    
    static canvas = document.querySelector("#board");
    static ctx = Board.canvas.getContext("2d");
    static fps = 60;
    static bpm = 240;
    static tileSize = 10;
    static changeTileSize(newTileSize) { this.tileSize = newTileSize }
    
    static get canvasRect() { return this.canvas.getBoundingClientRect() }
    static get width() { return Math.ceil(this.canvasRect.width / this.tileSize) }
    static get height() { return Math.ceil(this.canvasRect.height / this.tileSize) }
    static get gridSize() { return [this.width, this.height] }
    static get grid() {
        return [...Array(this.width * this.height)].map((_, i) => [
            Math.trunc(i / this.width),
            i % this.width
        ]);
    }
    static get outerTiles() {
        return [
            [...Array(Math.max(0, this.width - 2))], //ошибка
            [...Array(Math.max(0, this.height - 2))]
        ].flatMap((v, i, a) => v.flatMap((_, j) => [
            [(j + 1) * (1 - i), (j + 1) * i],
            [
               a[1 - i].length * i + (j + 1) * (1 - i) + i,
               a[1 - i].length * (1 - i) + (j + 1) * i + (1 - i)
            ]
       ])).concat([...Array(4)].map((_, i) => this.gridSize.map(
           (v, j) => (v - 1) * (Math.trunc((i - j + 1) / 2) % 2)
       )));
    }
    static randomFreeTile() {
        const unallowed = this.snake.tail.map(seg => seg.cords)
        .concat(this.snake.area)
        .concat(this.apple?.area ?? this.outerTiles);
        const allowed = this.grid.filter(cords => {
            return unallowed.every(bad => cords.toString() !== bad.toString());
        });
        return allowed[Math.floor(Math.random() * allowed.length)];
    }
    
    static spawnApple() { this.apple = new Apple(this.randomFreeTile) }
    
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
            /**
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
    
    static swipingSensitivity = 30;
    
    static async swipe (startCords) {
        const endCords = await new Promise(resolve => {
            document.body.addEventListener("pointerup", e => { resolve([e.offsetX, e.offsetY]) }, { once: 1 });
        });
        const vector = startCords.map((v, i) => -v + endCords[i]);
        //console.log(...startCords, ...endCords);
        //console.log(...endCords);
        //console.log(...vector);
        if (vector.every(v => Math.abs(v) < this.swipingSensivity)) { return }
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

    static DASH() {
        this.addInput(Board.snake.direction);
    }
    
    static init () {
        this.ctx.font = `${this.tileSize}px infex`;
        document.body.addEventListener("pointerdown", e => { this.swipe([e.offsetX, e.offsetY]) });
        document.body.addEventListener("keydown", e => { this.keyboardInput(e.code) })
        this.gameStart();
    }
}

B.init();
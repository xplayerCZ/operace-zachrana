class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Hitbox {
    constructor(x, y, width, height) {
        this.x = x - width / 2;
        this.y = y - height / 2;
        this.width = width;
        this.height = height;

        this.hitpoints = [];
        this.generate();
    }

    update(x, y) {
        this.x = x - this.width / 2 - gameArea.offsetX;
        this.y = y - this.height / 2;
        this.generate();
    }

    generate() {
        this.hitpoints = [];
        for(let i = 0; i <= this.width; i++) {
            this.hitpoints.push(new Point(i + this.x, this.y));
            this.hitpoints.push(new Point(i + this.x, this.y + this.height));
        }
        for(let i = 0; i <= 0 + this.height; i++) {
            this.hitpoints.push(new Point(this.x, i + this.y));
            this.hitpoints.push(new Point(this.x + this.width, i + this.y));
        }
    }

    paint(ctx) {
        ctx.fillStyle = "black";
        this.hitpoints.forEach((point) => {
            ctx.fillRect(point.x, point.y, 1,1);
        })
    }
}

class CollisionController {

}

class GameObject {
    constructor(x, y, width, height, src, speed, reverted, range) {
        this.speed = speed;
        this.reverted = reverted;
        this.width = width;
        this.height = height;
        this.src = src;
        this.range = range;

        this.angle = 0;
        this.x = x - width / 2;
        this.y = y - height / 2;
        this.image = new Image();
        this.hitbox = new Hitbox(x, y, width, height);
    }

    paint(ctx, offsetX, offsetY) {
        ctx.save();
        ctx.translate(this.x - offsetX, this.y);
        ctx.rotate(-this.angle * Math.PI / 180);

        if (!this.reverted) {
           this.image.src = this.src + "R.png";
        } else {
           this.image.src = this.src + ".png";
        }

        ctx.drawImage(this.image, 0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    move() {

        this.hitbox.update(this.x, this.y);

        this.x = this.x + this.speed * Math.cos(this.angle / 180 * Math.PI);
        this.y = this.y - this.speed * Math.sin(this.angle / 180 * Math.PI);
        /*
        if (!this.reverted) {
            this.x = this.x + this.speed * Math.cos(this.angle / 180 * Math.PI);
            this.y = this.y - this.speed * Math.sin(this.angle / 180 * Math.PI);
        } else {
            this.x = this.x - this.speed * Math.cos(this.angle / 180 * Math.PI);
            this.y = this.y + this.speed * Math.sin(this.angle / 180 * Math.PI);
        }
        */
        
        //console.log(this.speed * Math.cos(this.angle / 180), this.speed * Math.sin(this.angle / 180));
    }
}

class PlayerObject extends GameObject{
    constructor(x, y, width, height, src, speed, reverted, range) {
        super(x, y, width, height, src, speed, reverted, range);
        this.src = src;
        this.defaultX = x;
        this.defaultY = y;
    }

    paint(ctx) {
        this.angle %= 360;
        if(this.angle < 0){
            this.angle += 360;
        }
        if(this.angle > 90 && this.angle < 270) {
            this.reverted = true;
        } else {
            this.reverted = false;
        }
        ctx.save();
        ctx.translate(this.defaultX, this.y);
        ctx.rotate(-this.angle * Math.PI / 180);

        if (!this.reverted) {
            this.image.src = this.src + "R.png";
        } else {
            this.image.src = this.src + ".png";
        }

        ctx.drawImage(this.image, 0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    fire() {
        let xMax = range / Math.cos(this.angle / 180 * Math.PI);
        let yMax = range / Math.sin(this.angle / 180 * Math.PI);
        let divider = xMax > yMax ? xMax : yMax ;
        let points = [];
        
        for(let i = 0; i < xMax; i += xMax / divider){
            for(let j = 0; j < yMax; j += yMax / divider) {
                points.push(new Point(i + x, j + y));
            }
        }

        return points;
    }
}

class EnemyController {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    
        this.enemyPlanes = [];
        this.enemyPlanes.push(new GameObject(this.width / 2 + 500 + 450, this.height / 2 + 0, 1024 / 4, 328 / 4, "img/bomberPlane", 6, false));
        this.enemyPlanes.push(new GameObject(this.width / 2 + 500 + 550, this.height / 2 + 100, 1024 / 4, 328 / 4, "img/bomberPlane", 6, false));
        this.enemyPlanes.push(new GameObject(this.width / 2 + 500 + 500, this.height / 2 - 100, 1280 / 10, 463 / 10, "img/ik3", 6, false));
        this.enemyPlanes.push(new GameObject(this.width / 2 + 500 + 500, this.height / 2 + 200, 1280 / 10, 463 / 10, "img/ik3", 6, false));
    }
    
    moveAll(){
        this.enemyPlanes.forEach((enemyPlane) => {
            enemyPlane.move();
        })
    }

    paintAll(ctx, offsetX, offsetY){
        this.enemyPlanes.forEach((enemyPlane) => {
            enemyPlane.paint(ctx, offsetX, offsetY);
        });
    }

    showBorders(ctx) {
        this.enemyPlanes.forEach((enemyPlane) => {
            enemyPlane.hitbox.paint(ctx);
        });
    }
}

class GameArea {
    constructor (element, width, height, refreshRate){
        this.width = width;
        this.height = height;
        this.element = element;
        this.refreshRate = refreshRate;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style = 'border: 1px solid black';
        this.element.append(this.canvas);

        this.paused = true;

        //this.speedX = 0;
        //this.defaultX = this.width / 2 - 50;
        //this.defaultY = this.height / 2;

        this.player = new PlayerObject(this.width / 2 - 50, this.height / 2, 1280 / 10, 468 / 10, "img/p51", 2, false);
        this.enemyController = new EnemyController(this.width, this.height);
        //this.xOffset;
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.offsetX = this.player.x - this.player.defaultX;
        this.offsetY = this.player.y - this.player.defaultY;

        this.drawBackground();

        this.player.move();
        this.player.paint(this.ctx);
        this.player.hitbox.paint(this.ctx);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.player.x, this.player.y, 1, 1);

        this.enemyController.showBorders(this.ctx);

        this.enemyController.moveAll();
        this.enemyController.paintAll(this.ctx, this.offsetX, this.offsetY);
    }

    unpause(){
        this.timer = setInterval(() => {
            this.redraw();
            gameArea.paused = false;
        }, this.refreshRate)
    }

    pause(){
        clearInterval(this.timer);
        gameArea.paused = true;
    }

    drawBackground(){
        this.backgroundImg = new Image();
        this.backgroundImg.src = "img/blue.jpg"

        this.ctx.drawImage(this.backgroundImg, (0 - this.offsetX - this.player.width / 2) % this.width, 0 , 5392 / (1588 / this.width), this.height);
    }
}

//Bottom part, no classes

window.addEventListener('keydown', onKeyDown, false);
let speedLimit = 15;
let acceleration = 1;
let turnRate = 4;

function onKeyDown(event) {
    let keyCode = event.keyCode;

    console.log(keyCode);
    if(keyCode == 80) {
        if(gameArea.paused) {
            gameArea.unpause();
            console.log("Unpause");
        } else {
            gameArea.pause();
            console.log("Pause");
        }
    } else if(!gameArea.paused) {
        switch (keyCode) {
            case 37: //Left
                gameArea.player.angle += turnRate;
                console.log("Angle++");
                break;
            case 39: //Right
                gameArea.player.angle -= turnRate;
                console.log("Angle--");
                break;
            case 38: //Speed up
                if(gameArea.player.speed <= speedLimit)
                    gameArea.player.speed += acceleration;
                console.log("Speed++");
                break;
            case 40: //Speed down
                if(gameArea.player.speed > 2)
                    gameArea.player.speed -= acceleration;
                console.log("Speed--");
                break;
            case 82: //Revert
                gameArea.player.reverted = !gameArea.player.reverted;
                console.log("Revert");
                break;
        }
    }
    
}

let gameArea = new GameArea(document.getElementById('game'), 1280, 720, 20);
gameArea.unpause();
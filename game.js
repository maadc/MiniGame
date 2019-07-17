// game.js

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let backgroundImg = new Image();
let enemyImg = new Image();

let character = null;
let fireball = null;

let enemies = new Array();
let keysDown = {};

let frametimeBefore = Date.now();
let level = 0;

function init() {
    character = {
        img: new Image(),
        posX: 200,
        posY: 200,
        shooting: false,
        hp: 1000,
        speed: 300
    };
    shot = {
        img: new Image(),
        startX: 0,
        startY: 0,
        posX: 0,
        posY: 0,
        dirX: 0,
        dirY: 0,
        speed: 600
    };

    backgroundImg.src = 'images/background.png';
    character.img.src = 'images/character.png';
    shot.img.src = 'images/shot.png';
    enemyImg.src = 'images/enemy.png';

    //Auskommentieren für Spiel ohne Gegner
    //generateEnemies();

    window.addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    window.addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);
}

function generateEnemies() {
    ++level;

    for (let i = 0; i < level * 5; ++i) {
        // random Position
        let ranX = Math.floor(Math.random() * (canvas.width * 3)) - canvas.width;
        //let ranY = Math.floor(Math.random() * (canvas.height * 3)) - canvas.height;
        let ranY = Math.floor(Math.random() * -100);

        enemies[enemies.length] = {
            img: enemyImg,
            posX: ranX,
            posY: ranY,
            touched: false
        };
    }
}

function getDistance(obj1X, obj1Y, obj2X, obj2Y) {
    let a = obj1X - obj2X;
    let b = obj1Y - obj2Y;
    let distance = Math.sqrt((a * a) + (b * b));
    return distance;
}

function shoot() {
    character.shooting = true;
    shot.posX = shot.startX = character.posX;
    shot.posY = shot.startY = character.posY;

    if (37 in keysDown && 38 in keysDown) {
        shot.dirY = -0.5;
        shot.dirX = -0.5;
        return;
    } // "left top "

    if (37 in keysDown && 40 in keysDown) {
        shot.dirY = 0.5;
        shot.dirX = -0.5;
        return;
    } // "left down "

    if (39 in keysDown && 40 in keysDown) {
        shot.dirY = 0.5;
        shot.dirX = 0.5;
        return;
    } // "right down "

    if (39 in keysDown && 38 in keysDown) {
        shot.dirY = -0.5;
        shot.dirX = 0.5;
        return;
    } // "right up "

    if (37 in keysDown) {
        shot.dirY = 0;
        shot.dirX = -1;
    } // " left "
    if (38 in keysDown) {
        shot.dirY = -1;
        shot.dirX = 0;
    } // " top "
    if (39 in keysDown) {
        shot.dirY = 0;
        shot.dirX = 1;
    } // " right "
    if (40 in keysDown) {
        shot.dirY = 1;
        shot.dirX = 0;
    } // " down "

}

function enemyLogic(i, frametime) {
    let x = character.posX - enemies[i].posX;
    let y = character.posY - enemies[i].posY;
    // if(i == 0){
    //     console.log("x / y :" + x + " / " + y);
    // }

    //Laufe in die Richtung vom Charakter
    let angle = Math.atan2(y, x);
    enemies[i].posX += Math.cos(angle) * 200 * frametime;

    //Bevor Gegner und Charakter auf einer höhe sind, lauf 0.6 schnell, wenn du am Charakter
    //vorbei gelaufen bist, werde schneller
    if (y >= -32) {
        enemies[i].posY += 0.6 * 200 * frametime;
    } else {
        enemies[i].posY += 1 * 200 * frametime;
    }

    //Wenn du am Ende vom Canvas bist: teleport nach oben + rnd. X-Position
    if (enemies[i].posY >= (canvas.height + enemies[i].img.height)) {
        enemies[i].posY = -enemies[i].img.height;
        //Kann wieder schaden machen.
        enemies[i].touched = false;
        debugger;

        if (Math.random() < 0.5) {
            enemies[i].posX = Math.floor(Math.random() * 300);
        } else {
            enemies[i].posX = Math.floor(Math.random() * 300 + 300);
        }
    }

    //Kollision zwischen Schuss und Gegner
    if ((collision(enemies[i], shot) === true) && character.shooting === true) {
        character.shooting = false;
        enemies.splice(i, 1);
    }

    //Kollision zwischen Charakter und Gegner
    if (character.hp > 0 && enemies[i].touched === false && (collision(enemies[i], character) === true) ) {
        //DAMAGE:
        //character.hp -= 1;
        enemies[i].touched = true;
    }
}

function collision(a, b) {
    if ((a.posX >= b.posX && a.posX <= b.posX + a.img.width && a.posY >= b.posY && a.posY <= b.posY + b.img.height) ||
        (b.posX >= a.posX && b.posX <= a.posX + a.img.width && a.posY >= b.posY && a.posY <= b.posY + b.img.height) ||
        (b.posX >= a.posX && b.posX <= a.posX + a.img.width && b.posY >= a.posY && b.posY <= a.posY + a.img.height) ||
        (a.posX >= b.posX && a.posX <= b.posX + a.img.width && b.posY >= a.posY && b.posY <= a.posY + a.img.height)) {
        return true;
    }
    return false;
}

function logic(frametime) {
    if ((37 in keysDown || 38 in keysDown || 39 in keysDown || 40 in keysDown) && character.shooting == false) {
        shoot();
    }
    if (87 in keysDown && (character.posY > 0)) {
        character.posY -= character.speed * frametime;
    } // W
    if (65 in keysDown && (character.posX > 0)) {
        character.posX -= character.speed * frametime;
    } // A
    if (83 in keysDown && (character.posY < (canvas.height - character.img.height))) {
        character.posY += character.speed * frametime;
    } // S
    if (68 in keysDown && (character.posX < (canvas.width - character.img.width))) {
        character.posX += character.speed * frametime;
    } // D

    //console.log("character pos: " + character.posX + "/" + character.posY);

    //Check Shooting
    let distance = getDistance(shot.startX, shot.startY, shot.posX, shot.posY);

    if (character.shooting == true) {
        shot.posX += shot.dirX * shot.speed * frametime;
        shot.posY += shot.dirY * shot.speed * frametime;

        if (distance >= 200 /*|| shot.posX > canvas.width || shot.posX < 0 || shot.posY > canvas.height || shot.posY < 0*/ ) {
            character.shooting = false;
        }
    }

    //Auskommentieren für Spiel ohne Gegner  
    if (enemies.length == 0) {
        generateEnemies()
    };

    for (let i = 0; i < enemies.length; ++i) {
        enemyLogic(i, frametime);
    }
}

function draw() {
    ctx.drawImage(backgroundImg, 0, 0);

    if (character.hp > 0) {
        if (character.shooting == true) {
            ctx.drawImage(shot.img, shot.posX, shot.posY);
        }
        for (let i = 0; i < enemies.length; ++i) {
            ctx.drawImage(enemies[i].img, enemies[i].posX, enemies[i].posY);
        }

        ctx.drawImage(character.img, character.posX, character.posY);


    }

    ctx.font = "20px Verdana";
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillText("Level: " + level, 20, 30)
    ctx.fillText("HP: " + Math.ceil(character.hp), 20, 60);
}

function gameLoop() {
    let now = Date.now();
    let frametime = (now - frametimeBefore) / 1000;

    logic(frametime);
    draw();

    frametimeBefore = now;
}

init();
setInterval(gameLoop, 0);
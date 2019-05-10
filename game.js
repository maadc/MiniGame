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
    window.addEventListener("click", shoot, false);
}

function generateEnemies() {
    ++level;

    for (let i = 0; i < level * 5; ++i) {
        // random position
        let ranX = Math.floor(Math.random() * (canvas.width * 3)) - canvas.width;
        let ranY = Math.floor(Math.random() * (canvas.height * 3)) - canvas.height;

        enemies[enemies.length] = {
            img: enemyImg,
            posX: ranX,
            posY: ranY
        };
    }
}

function getDistance(obj1, obj2){
    let a = obj1.posX - obj2.posX;
    let b = obj1.posY - obj2.posY;

    let angle = Math.atan2(b,a);
    let angleDeg = angle * (180/Math.PI);
    //console.log("Shoot angle: "+ angleDeg);

    if (angle >= 0){
    let distance = Math.cos(angle) * a;
    return distance;
    }
    //else if(angleDeg > 90 && angleDeg <= 180){
    //    let distance = Math.tan(angle) * a;
    //   return distance;
    //}
    
}

function shoot(e) {
    if (character.shooting) return;

    character.shooting = true;

    shot.posX = character.posX;
    shot.posY = character.posY;

    //Get Angel from 2 Points
    let x = e.clientX - character.posX;
    let y = e.clientY - character.posY;

    let angle = Math.atan2(y, x);
    let angleDeg = angle * (180/Math.PI);
    console.log("Shoot angle: "+ angle);

    shot.dirX = Math.cos(angle);
    shot.dirY = Math.sin(angle);
}

function enemyLogic(i, frametime) {
    let x = character.posX - enemies[i].posX;
    let y = character.posY - enemies[i].posY;

    let angle = Math.atan2(y, x);

    enemies[i].posX += Math.cos(angle) * 200 * frametime;
    enemies[i].posY += Math.sin(angle) * 200 * frametime;

    if (character.shooting &&
        shot.posX >= enemies[i].posX && shot.posX <= enemies[i].posX + 32 &&
        shot.posY >= enemies[i].posY && shot.posY <= enemies[i].posY + 32) {
        enemies.splice(i, 1);
        character.shooting = false;
    }

    if (character.hp > 0 &&
        enemies[i].posX >= character.posX && enemies[i].posX <= character.posX + 32 &&
        enemies[i].posY >= character.posY && enemies[i].posY <= character.posY + 32) {
        character.hp -= 50 * frametime;
    }
}

function logic(frametime) {
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
    let distance = getDistance(character, shot);

    if (character.shooting) {
        shot.posX += shot.dirX * shot.speed * frametime;
        shot.posY += shot.dirY * shot.speed * frametime;


        if (distance >= 100 || shot.posX < 0 || shot.posX > canvas.width || shot.posY < 0 || shot.posY > canvas.height) {
            character.shooting = false;
        }
    }

    for (let i = 0; i < enemies.length; ++i) {
        enemyLogic(i, frametime);
    }

    //Auskommentieren für Spiel ohne Gegner  
    //if(enemies.length == 0) generateEnemies();
}

function draw() {
    ctx.drawImage(backgroundImg, 0, 0);

    if (character.hp > 0) {
        for (let i = 0; i < enemies.length; ++i) {
            ctx.drawImage(enemies[i].img, enemies[i].posX, enemies[i].posY);
        }

        ctx.drawImage(character.img, character.posX, character.posY);

        if (character.shooting) {
            ctx.drawImage(shot.img, shot.posX, shot.posY);
        }
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
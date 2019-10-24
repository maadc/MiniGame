// game.js

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let backgroundImg = new Image();
let enemyImg = new Image();
let shotImg = new Image();

let character = null;
let fireball = null;
let shots = new Array();
let enemies = new Array();
let keysDown = {};

let frametimeBefore = Date.now();
let frametime; // in seconds

function init() {
    character = {
        img: new Image(),
        posX: 200,
        posY: 200,
        maxShots: 2,
        hp: 1000,
        speed: 300,
    };
    gun = {
        reloadTime: 0.4, // in sec.
        status: 2, // 2=shooting, 1=reloading, 0=ready
    };
    preferences = {
        enemies: true,
        enemiesNumber: enemies.length,
        level: 0,
    };

    backgroundImg.src = 'images/background.png';
    character.img.src = 'images/character.png';
    shotImg.src = 'images/shot.png';
    enemyImg.src = 'images/enemy.png';

    if (preferences.enemies === true) {
        generateEnemies();
    }
    window.addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    window.addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);
}

function generateEnemies() {
    ++preferences.level;
    for (let i = 0; i < preferences.level * 5; ++i) {
        // random position
        let ranX = Math.floor(Math.random() * (canvas.width * 3)) - canvas.width;
        //let ranY = Math.floor(Math.random() * (canvas.height * 3)) - canvas.height;
        let ranY = Math.floor(Math.random() * -100);

        //generate an enemie object inside the enemie-array
        enemies[enemies.length] = {
            img: enemyImg,
            posX: ranX,
            posY: ranY,
            speed: 200,
            damage: 0,
            touched: false
        };
    }
}

function generateShots() {
    shots[shots.length] = {
        img: shotImg,
        startX: character.posX,
        startY: character.posY,
        posX: character.posX,
        posY: character.posY,
        dirX: 0,
        dirY: 0,
        distance: 0, // in px
        maxDistance: 250, // in px 
        airTime: 0, // in sec.
        speed: 400
    }
    shotDirection(shots[shots.length - 1]);

    function shotDirection(shot) {
        if (37 in keysDown && 38 in keysDown) {
            shot.dirY = -0.5;
            shot.dirX = -0.5;
            return;
        } // "left top "
        else if (37 in keysDown && 40 in keysDown) {
            shot.dirY = 0.5;
            shot.dirX = -0.5;
            return;
        } // "left down "
        else if (39 in keysDown && 40 in keysDown) {
            shot.dirY = 0.5;
            shot.dirX = 0.5;
            return;
        } // "right down "
        else if (39 in keysDown && 38 in keysDown) {
            shot.dirY = -0.5;
            shot.dirX = 0.5;
            return;
        } // "right up "
        else if (37 in keysDown) {
            shot.dirY = 0;
            shot.dirX = -1;
            return;
        } // " left "
        else if (38 in keysDown) {
            shot.dirY = -1;
            shot.dirX = 0;
            return;
        } // " top "
        else if (39 in keysDown) {
            shot.dirY = 0;
            shot.dirX = 1;
            return;
        } // " right "
        else if (40 in keysDown) {
            shot.dirY = 1;
            shot.dirX = 0;
            return;
        } // " down "
        else {
            shots.splice(shots.length - 1, 1);;
        }
    }
}

function getDistance(obj1X, obj1Y, obj2X, obj2Y) {
    let a = obj1X - obj2X;
    let b = obj1Y - obj2Y;
    let distance = Math.sqrt((a * a) + (b * b));
    return distance;
}

function collision(a, b) {
    if ((a.posX >= b.posX && a.posX <= b.posX + b.img.width && a.posY >= b.posY && a.posY <= b.posY + b.img.height) ||
        (b.posX >= a.posX && b.posX <= a.posX + a.img.width && a.posY >= b.posY && a.posY <= b.posY + b.img.height) ||
        (b.posX >= a.posX && b.posX <= a.posX + a.img.width && b.posY >= a.posY && b.posY <= a.posY + a.img.height) ||
        (a.posX >= b.posX && a.posX <= b.posX + b.img.width && b.posY >= a.posY && b.posY <= a.posY + a.img.height)) {
        return true;
    }
    return false;
}

function logic(frametime) {
    if ((37 in keysDown || 38 in keysDown || 39 in keysDown || 40 in keysDown) && shots.length < character.maxShots) {
        if (shots.length >= 1) {
            if (shots[shots.length - 1].airTime >= gun.reloadTime) {
                generateShots();
            }
        } else {
            generateShots();
        }
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

    for (let i = 0; i < shots.length; ++i) {
        shotLogic(i, frametime);
    }
    if (enemies.length == 0) {
        if (preferences.enemies === true) {
            generateEnemies();
        }
    }
    if (preferences.enemies === true) {
        for (let i = 0; i < enemies.length; ++i) {
            enemyLogic(i, frametime);
        }
    }
}


function shotLogic(i, frametime) {
    //update positon/air time of shot
    shots[i].posX += shots[i].dirX * shots[i].speed * frametime;
    shots[i].posY += shots[i].dirY * shots[i].speed * frametime;
    shots[i].airTime += frametime;
    shots[i].distance = getDistance(shots[i].startX, shots[i].startY, shots[i].posX, shots[i].posY);

    if (shots[i].distance >= shots[i].maxDistance) {
        shots.splice(i, 1);
    }
}

function enemyLogic(i, frametime) {
    let x = character.posX - enemies[i].posX;
    let y = character.posY - enemies[i].posY;

    //walk from the top to the direction of character
    let angle = Math.atan2(y, x);
    enemies[i].posX += Math.cos(angle) * enemies[i].speed * frametime;

    //befor enemie is at the same hight as character: runningSpeed = 0.6
    //after that: runningSpeed = 1
    if (y >= -32) {
        enemies[i].posY += 0.6 * enemies[i].speed * frametime;
    } else {
        enemies[i].posY += 1 * enemies[i].speed * frametime;
    }

    //if enemie is at the end of the canvas: teleport to top + rnd. x-position
    if (enemies[i].posY >= (canvas.height + enemies[i].img.height)) {
        enemies[i].posY = -enemies[i].img.height;
        enemies[i].touched = false;

        if (Math.random() < 0.5) {
            enemies[i].posX = Math.floor(Math.random() * 300);
        } else {
            enemies[i].posX = Math.floor(Math.random() * 300 + 300);
        }
    }

    //collision between character and enemie
    if (character.hp > 0 && enemies[i].touched === false && (collision(enemies[i], character) === true)) {
        character.hp -= enemies[i].damage;
        enemies[i].touched = true;
    }
    //collision between enemie and shot
    if (shots.length >= 1) {
        debugger;
        for (let s = 0; s < shots.length; ++s) {
            if (shots[s].status === 2 && (collision(enemies[i], shots[s]) === true)) {
                shots[s].status = 1;
                enemies.splice(i, 1);
            }
        }
    }
}

function draw() {
    ctx.drawImage(backgroundImg, 0, 0);

    if (character.hp > 0) {
        for (let i = 0; i < shots.length; ++i) {
            if (shots[i].status === 2) {
                ctx.drawImage(shots[i].img, shots[i].posX, shots[i].posY);
            }
        }
        if (preferences.enemies === true) {
            for (let i = 0; i < enemies.length; ++i) {
                ctx.drawImage(enemies[i].img, enemies[i].posX, enemies[i].posY);
            }
        }
        ctx.drawImage(character.img, character.posX, character.posY);
    }
    ctx.font = "20px Verdana";
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillText("Level: " + preferences.level, 20, 30)
    ctx.fillText("HP: " + Math.ceil(character.hp), 20, 60);
}

function gameLoop() {
    let now = Date.now(); //gibt eine bestimmte Anzahl an Millisekunden aus. 
    frametime = (now - frametimeBefore) * 0.001; 
    // Abhängigkeit von Frametime ist wichtig, weil selbst bei geringer Prozessorgeschwindigkeit
    // das Spiel nicht schneller laufen soll, als der Spieler es spielen kann. 
    // gleichzeitig bestimmt die frametim die Spielgeschwindigkeit.
    logic(frametime);
    draw();
    frametimeBefore = now;
}

init();
setInterval(gameLoop, 0);
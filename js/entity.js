const breakSfx = new Audio("src/sfx/pling.mp3");

const fall_point = [0, 50, 100, 150, 200, 250, 300, 350, 400];
const asteroidWidth = 100;
const asteroidHeight = 100;
const asteroidSpeed = 0.5;

let enemyShipImg = new Image(); // 이미지 객체
let enemyShipX = 0;
let enemyShipY = 0;
const enemyShipWidth = 64;
const enemyShipHeight = 64;
const enemyShipSpeed = 1;
let enemyShipInitialized = false;

const asteroidImages = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/asteroid/asteroid_${i}.png`;
    asteroidImages.push(img);
}

let asteroids = [];


function breakPlay() {
    breakSfx.volume = localStorage.getItem("sfx-volume") / 100;
    breakSfx.currentTime = 0;
    breakSfx.play();
}

function createAsteroid(x){
    const spriteIndex = Math.floor(Math.random() * asteroidImages.length);
    const direction = Math.random() < 0.5 ? -1 : 1; // 반시계 또는 시계 방향
    asteroids.push({
        x: x,
        y: 0,
        width: asteroidWidth,
        height: asteroidHeight,
        img: asteroidImages[spriteIndex],
        angle: 0, // 초기 각도
        rotationSpeed: direction * (Math.PI / 180) // 1도 = π/180 라디안
    });
}

function updateAsteroid(){
    for (let i = asteroids.length - 1 ; i >= 0 ; i--){
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;
        asteroid.angle += asteroid.rotationSpeed; // 회전 업데이트

        // 공 & 운석 충돌
        if (ball && isColliding(ball, asteroid)){
            breakPlay();
            ball.vy *= -1; // 반사
            asteroids.splice(i, 1);
            continue;
        }

        // 바닥에 운석 충돌
        if (asteroid.y > canvas.height){
            asteroids.splice(i, 1);
            subtractLives();
            return;
        }
    }
}

const directionChoices = [-enemyShipSpeed, 0, enemyShipSpeed];
let count = 0;
let enemyShipdx = 0;

function updateEnemyShip() {
    if (!enemyShipInitialized && canvas.width && canvas.height) {
        enemyShipY = canvas.height * 0.1;
        enemyShipX = canvas.width / 2 - enemyShipWidth / 2;
        enemyShipInitialized = true;
    }

    count++;
    if (count === 100) {
        enemyShipdx = directionChoices[Math.floor(Math.random() * directionChoices.length)];
        count = 0;
    }

    enemyShipX += enemyShipdx;

    if (enemyShipX < 0) enemyShipX = 0;
    if (enemyShipX + enemyShipWidth > canvas.width) {
        enemyShipX = canvas.width - enemyShipWidth;
    }
}

function isColliding(ball, asteroid){
    return (
        ball.x < asteroid.x + asteroid.width &&
        ball.x + ballSize > asteroid.x &&
        ball.y < asteroid.y + asteroid.height &&
        ball.y + ballSize > asteroid.y
    );
}

function drawAsteroids(){
    for (const asteroid of asteroids) {
        if (!asteroid.img || !asteroid.img.complete) continue;

        const cx = asteroid.x + asteroid.width / 2;
        const cy = asteroid.y + asteroid.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(asteroid.angle);
        ctx.drawImage(
            asteroid.img,
            -asteroid.width / 2,
            -asteroid.height / 2,
            asteroid.width,
            asteroid.height
        );
        ctx.restore();
    }
}

function drawEnemyShip() {
    if (enemyShipImg.complete) {
        ctx.drawImage(enemyShipImg, enemyShipX, enemyShipY, enemyShipWidth, enemyShipHeight);
    }
}

setInterval(() => {
    const randomIndex = Math.floor(Math.random() * fall_point.length);
    createAsteroid(fall_point[randomIndex]);
}, 5000);

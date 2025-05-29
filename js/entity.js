const breakSfx = new Audio("src/sfx/pling.mp3");

let asteroidSpawnTimer = -1;  // START 후 1초 지연
const asteroidSpawnInterval = 5;

let lastEnemyHitTime = 0;
const enemyHitCooldown = 0.5;

const shrinkRatio = 0.8; //히트박스 크기 조정 (0.8 : 이미지의 80%만큼만을 히트박스로)

const fall_point = [0, 50, 100, 150, 200, 250, 300, 350, 400];
const asteroidWidth = 100;
const asteroidHeight = 100;
const asteroidSpeed = 0.5;

let enemyShipImg = new Image();
let enemyShipX = 0;
let enemyShipY = 0;
const enemyShipWidth = 64;
const enemyShipHeight = 64;
const enemyShipSpeed = 1;
let enemyShipInitialized = false;
let enemyShipHP = Infinity;
let enemyShipAlive = true;
let enemyShipInvincible = false;
let enemyShipInvincibleTimer = 0;
const enemyShipInvincibleDuration = 1; // 3초

const itemTypes = ['ammo', 'energy', 'health', 'rockets'];
const itemWidth = 30;
const itemHeight = 30;
const itemSpeed = 100;
const itemDropChance = 1;

const asteroidImages = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/asteroid/asteroid_${i}.png`; // 수정
    asteroidImages.push(img);
}

const itemImages = {};
itemTypes.forEach(type => {
    itemImages[type] = new Image();
    itemImages[type].src = `src/icons/${type}.png`; // 수정
});

let asteroids = [];
let items = [];

function resetEntities() {
    asteroids = [];
    items = [];
    enemyShipInitialized = false;
    enemyShipX = 0;
    enemyShipY = 0;
}

function breakPlay() {
    breakSfx.volume = localStorage.getItem("sfx-volume") / 100;
    breakSfx.currentTime = 0;
    breakSfx.play();
}

function createAsteroid(x) {
    const spriteIndex = Math.floor(Math.random() * asteroidImages.length);
    const direction = Math.random() < 0.5 ? -1 : 1;
    asteroids.push({
        x: x,
        y: 0,
        width: asteroidWidth,
        height: asteroidHeight,
        img: asteroidImages[spriteIndex],
        angle: 0,
        rotationSpeed: direction * (Math.PI / 180)
    });
}

function createItem(x, y) {
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    items.push({
        x: x,
        y: y,
        width: itemWidth,
        height: itemHeight,
        type: randomType,
        img: itemImages[randomType],
    });
}

function updateAsteroidSpawn(delta) {
    if (!isPlaying) return;
    asteroidSpawnTimer += delta;

    if (asteroidSpawnTimer >= asteroidSpawnInterval) {
        asteroidSpawnTimer = 0;
        const randomIndex = Math.floor(Math.random() * fall_point.length);
        createAsteroid(fall_point[randomIndex]);
    }
}

function updateAsteroid() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;
        asteroid.angle += asteroid.rotationSpeed;

        if (ball && isColliding(ball, asteroid)) {
            const dir = getCollisionDirection(ball, asteroid);
            if (dir === "left" || dir === "right") ball.vx *= -1;
            else ball.vy *= -1;

            breakPlay();
            asteroids.splice(i, 1);

            if (Math.random() < itemDropChance) {
                createItem(
                    asteroid.x + asteroid.width / 2 - itemWidth / 2,
                    asteroid.y + asteroid.height / 2 - itemHeight / 2
                );
            }
            continue;
        }

        if (asteroid.y > canvas.height) {
            asteroids.splice(i, 1);
            subtractLives();
            return;
        }
    }
}

function updateItems(delta) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += itemSpeed * delta;

        if (item.y > canvas.height) {
            items.splice(i, 1);
            continue;
        }

        if (itemHitsBar(item)) {
            applyItemEffect();
            const itemSfx = new Audio("src/sfx/pling.mp3");
            itemSfx.volume = localStorage.getItem("sfx-volume") / 100;
            itemSfx.play();

            items.splice(i, 1);
        }
    }
}

function itemHitsBar(item) {
    return (
        item.x < bar.x + bar.width &&
        item.x + item.width > bar.x &&
        item.y < bar.y + bar.height &&
        item.y + item.height > bar.y
    );
}

function applyItemEffect() {
    console.log("아이템을 먹었습니다.");
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
    if (enemyShipX + enemyShipWidth > canvas.width)
        enemyShipX = canvas.width - enemyShipWidth;
}

function isColliding(ball, asteroid) {
    return (
        ball.x < asteroid.x + asteroid.width &&
        ball.x + ballSize > asteroid.x &&
        ball.y < asteroid.y + asteroid.height &&
        ball.y + ballSize > asteroid.y
    );
}

function isBallHitEnemyShip(ball) {
    if (!enemyShipAlive) return false;

    const now = performance.now() / 1000;

    // 무적 상태이거나 쿨타임 내 재충돌 시 return
    if (enemyShipInvincible || now - lastEnemyHitTime < enemyHitCooldown) return false;

    // 축소된 히트박스 계산
    const hitW = enemyShipWidth * shrinkRatio;
    const hitH = enemyShipHeight * shrinkRatio;
    const ex = enemyShipX + (enemyShipWidth - hitW) / 2;
    const ey = enemyShipY + (enemyShipHeight - hitH) / 2;

    const ballCx = ball.x + ballSize / 2;
    const ballCy = ball.y + ballSize / 2;

    const hit = (
        ballCx > ex && ballCx < ex + hitW &&
        ballCy > ey && ballCy < ey + hitH
    );

    if (!hit) return false;

    // ✅ 항상 반사 먼저 처리
    const dir = getCollisionDirection(ball, { x: ex, y: ey, width: hitW, height: hitH });
    if (dir === "left" || dir === "right") ball.vx *= -1;
    else ball.vy *= -1;

    reflexPlay();

    lastEnemyHitTime = now;
    if (enemyShipHP !== Infinity) {
        enemyShipHP--;
        if (enemyShipHP <= 0) {
            enemyShipAlive = false;
        } else {
            enemyShipInvincible = true;
            enemyShipInvincibleTimer = enemyShipInvincibleDuration;
        }
    }
    return true;
}

function updateEnemyShipInvincibility(delta) {
    if (enemyShipInvincible) {
        enemyShipInvincibleTimer -= delta;
        if (enemyShipInvincibleTimer <= 0) {
            enemyShipInvincible = false;
        }
    }
}

function drawAsteroids() {
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

function drawItems() {
    for (const item of items) {
        if (!item.img || !item.img.complete) continue;

        ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
    }
}

function getCollisionDirection(ball, obj) {
    const ballCx = ball.x + ballSize / 2;
    const ballCy = ball.y + ballSize / 2;
    const objCx = obj.x + obj.width / 2;
    const objCy = obj.y + obj.height / 2;

    const dx = ballCx - objCx;
    const dy = ballCy - objCy;

    return Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? "right" : "left")
        : (dy > 0 ? "bottom" : "top");
}

function drawEnemyShip() {
    if (!enemyShipAlive || !enemyShipImg.complete) return;

    // 무적 상태면 깜박깜박 (0.1초 주기)
    if (enemyShipInvincible && Math.floor(performance.now() / 100) % 2 === 0) return;

    ctx.drawImage(enemyShipImg, enemyShipX, enemyShipY, enemyShipWidth, enemyShipHeight);
    drawEnemyHPBar();
}

function drawEnemyHPBar() {
    if (!enemyShipAlive) return;

    const barWidth = 60;
    const barHeight = 8;
    const barX = enemyShipX + (enemyShipWidth - barWidth) / 2;
    const barY = enemyShipY - 12;

    ctx.fillStyle = "gray";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    if (enemyShipHP === Infinity) {
        ctx.fillStyle = "#800080";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Infinite", barX + barWidth / 2, barY + barHeight - 1);
        return;
    }

    const totalHP = level === 1 ? 3 : level === 2 ? 5 : 7;
    const segmentWidth = barWidth / totalHP;

    for (let i = 0; i < enemyShipHP; i++) {
        ctx.fillStyle = "limegreen";
        ctx.fillRect(barX + i * segmentWidth, barY, segmentWidth - 1, barHeight);
    }
}

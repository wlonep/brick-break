const breakSfx = new Audio("src/sfx/pling.mp3");
const explosionSfx = new Audio("src/sfx/cannon.mp3");

let asteroidExplosions = [];
let asteroidExplosionFrames = [];
setAsteroidExplosionFrames();

let timeBalance = 1.0; // 단위: 초
let asteroidSpawnTimer = -1;  // START 후 1초 지연

let lastEnemyHitTime = 0;
const enemyHitCooldown = 0.5;

const shrinkRatio = 0.9; //히트박스 크기 조정 (0.8 : 이미지의 80%만큼만을 히트박스로)

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
const enemyShipInvincibleDuration = 1;

let enemyLasers = [];
const enemyLaserSpeed = 250; // 레이저 속도 조절(공이 지금 400임)
let enemyLaserTimer = 0;
const enemyLaserImg = new Image();
enemyLaserImg.src = "src/ball/enemyship_bullet.png";
const laserAngles = [-30, -10, 10, 30].map(deg => deg * Math.PI / 180); // -30°, -10°, 10°, 30°


const asteroidImages = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/asteroid/asteroid_${i}.png`; // 수정
    asteroidImages.push(img);
}

let asteroids = [];

function resetEntities() {
    asteroids = [];
    items = [];
    enemyShipInitialized = false;
    enemyShipX = 0;
    enemyShipY = 0;
    enemyLasers = [];
}

function breakPlay() {
    breakSfx.volume = localStorage.getItem("sfx-volume") / 100;
    breakSfx.currentTime = 0;
    breakSfx.play().then();
}

function createAsteroid(x) {
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

function updateAsteroidSpawn(delta) {
    if (!isPlaying) return;

    asteroidSpawnTimer += delta;
    const interval = getAsteroidIntervalByLevel(); // 동적 주기

    if (asteroidSpawnTimer >= interval && (enemyShipAlive || !stopScroll)) {
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

        let collisionHandled = false; // 해당 운석에 대해 충돌 처리 여부 추적
        for (let j = balls.length - 1; j >= 0; j--) {
            const ball = balls[j];
            if (ball && isColliding(ball, asteroid) && !collisionHandled && !ball.collided) {
                ball.collided = true;
                spawnExplosion(ball.x + ballSize / 2, ball.y + ballSize / 2);

                // 운석 중심에서 폭발
                spawnAsteroidExplosion(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);

                // 폭발 사운드 재생
                explosionSfx.volume = localStorage.getItem("sfx-volume") / 100;
                explosionSfx.currentTime = 0;
                explosionSfx.play();

                // 충돌 방향 계산 (이동 방향 기준)
                const dir = getCollisionDirection(ball, asteroid);

                // // 공의 위치를 이전 프레임 위치로 되돌림
                // ball.x = ball.prevX;
                // ball.y = ball.prevY;
                //
                // // 충돌 방향에 따라 방향 변경 및 위치 보정
                // if (dir === "left") {
                //     ball.x = asteroid.x - ballSize;
                //     ball.vx *= -1;
                // } else if (dir === "right") {
                //     ball.x = asteroid.x + asteroid.width;
                //     ball.vx *= -1;
                // } else if (dir === "top") {
                //     ball.y = asteroid.y - ballSize;
                //     ball.vy *= -1;
                // } else if (dir === "bottom") {
                //     ball.y = asteroid.y + asteroid.height;
                //     ball.vy *= -1;
                // }

                // 속도 반사
                if (dir === "left" || dir === "right") {
                    ball.vx *= -1;
                    // 위치 보정
                    ball.x = dir === "left" ? asteroid.x - ballSize : asteroid.x + asteroid.width;
                } else {
                    ball.vy *= -1;
                    // 위치 보정
                    ball.y = dir === "top" ? asteroid.y - ballSize : asteroid.y + asteroid.height;
                }

                breakPlay();
                addScore(50);
                asteroids.splice(i, 1);

                if (Math.random() < itemDropChance) {
                    createItem(
                        asteroid.x + asteroid.width / 2 - itemWidth / 2,
                        asteroid.y + asteroid.height / 2 - itemHeight / 2
                    );
                }

                collisionHandled = true; // 충돌 처리 완료
                break; // 해당 공의 처리 종료
            }
        }

        if (asteroid.y > canvas.height) {
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

window.spawnAsteroidExplosion = spawnAsteroidExplosion;

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
    spawnExplosion(ball.x + ballSize / 2, ball.y + ballSize / 2);

    const dir = getCollisionDirection(ball, {x: ex, y: ey, width: hitW, height: hitH});
    if (dir === "left" || dir === "right") ball.vx *= -1;
    else ball.vy *= -1;

    lastEnemyHitTime = now;
    if (enemyShipHP !== Infinity) {
        enemyShipHP--;
        if (enemyShipHP <= 0) {
            // const cannonSFX = new Audio("src/sfx/cannon.mp3");
            // cannonSFX.volume = localStorage.getItem("sfx-volume") / 100;
            // cannonSFX.currentTime = 0;
            // cannonSFX.play().then();

            spawnAsteroidExplosion(enemyShipX + enemyShipWidth / 2, enemyShipY + enemyShipHeight / 2);
            explosionSfx.volume = localStorage.getItem("sfx-volume") / 100;
            explosionSfx.currentTime = 0;
            explosionSfx.play();

            addScore(500);
            enemyShipAlive = false;
        } else {
            breakPlay();
            addScore(100);
            enemyShipInvincible = true;
            enemyShipInvincibleTimer = enemyShipInvincibleDuration;
        }
    } else {
        addScore(150);
        breakPlay();
    }
    return true;
}

function isLaserHitPlayer(laser) {
    return (
        laser.x > shipX &&
        laser.x < shipX + shipWidth &&
        laser.y > shipY &&
        laser.y < shipY + shipHeight
    );
}

function updateEnemyShipInvincibility(delta) {
    if (enemyShipInvincible) {
        enemyShipInvincibleTimer -= delta;
        if (enemyShipInvincibleTimer <= 0) {
            enemyShipInvincible = false;
        }
    }
}

function updateEnemyLasers(delta) {
    // 난이도 기반 주기 결정
    let cooldown = getLaserCooldownByLevel();

    enemyLaserTimer += delta;
    if (enemyLaserTimer >= cooldown) {
        fireEnemyLaser();
        enemyLaserTimer = 0;
    }

    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        laser.x += laser.vx * enemyLaserSpeed * delta;
        laser.y += laser.vy * enemyLaserSpeed * delta;

        if (laser.x < 0 || laser.x > canvas.width || laser.y > canvas.height) {
            enemyLasers.splice(i, 1);
            continue;
        }

        if (isLaserHitPlayer(laser)) {
            subtractLives();
            enemyLasers.splice(i, 1);
        }
    }
}

function fireEnemyLaser() {
    if (!enemyShipAlive) return;

    for (const angle of laserAngles) {
        enemyLasers.push({
            x: enemyShipX + enemyShipWidth / 2,
            y: enemyShipY + enemyShipHeight,
            vx: Math.sin(angle),
            vy: Math.cos(angle),
        });
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
    drawAsteroidExplosions(); // 운석 폭발 렌더링
}

function getCollisionDirection(ball, obj) {
    // 공의 이동 방향을 기준으로 충돌 방향 판단
    const dx = ball.x - ball.prevX;
    const dy = ball.y - ball.prevY;

    // 공의 중심 위치
    const ballCx = ball.x + ballSize / 2;
    const ballCy = ball.y + ballSize / 2;
    const objLeft = obj.x;
    const objRight = obj.x + obj.width;
    const objTop = obj.y;
    const objBottom = obj.y + obj.height;

    // 이동 방향과 충돌 지점을 기준으로 방향 결정
    if (dx > 0 && ballCx >= objLeft && ball.prevX + ballSize / 2 <= objLeft) {
        return "left"; // 오른쪽으로 이동 중, 운석 왼쪽 면 충돌
    } else if (dx < 0 && ballCx <= objRight && ball.prevX + ballSize / 2 >= objRight) {
        return "right"; // 왼쪽으로 이동 중, 운석 오른쪽 면 충돌
    } else if (dy > 0 && ballCy >= objTop && ball.prevY + ballSize / 2 <= objTop) {
        return "top"; // 아래로 이동 중, 운석 윗면 충돌
    } else if (dy < 0 && ballCy <= objBottom && ball.prevY + ballSize / 2 >= objBottom) {
        return "bottom"; // 위로 이동 중, 운석 아랫면 충돌
    }

    // 기본적으로 현재 위치 기준으로 판단 (보조적)
    // const objCx = obj.x + obj.width / 2;
    // const objCy = obj.y + obj.height / 2;
    // const dxPos = ballCx - objCx;
    // const dyPos = ballCy - objCy;

    // 이동 방향이 미세할 경우 위치 기반 판단
    const overlapLeft = ballCx - objLeft;
    const overlapRight = objRight - ballCx;
    const overlapTop = ballCy - objTop;
    const overlapBottom = objBottom - ballCy;

    // 가장 작은 겹침 방향을 선택
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) return "left";
    if (minOverlap === overlapRight) return "right";
    if (minOverlap === overlapTop) return "top";
    return "bottom";

    // return Math.abs(dxPos) > Math.abs(dyPos)
    //     ? (dxPos > 0 ? "right" : "left")
    //     : (dyPos > 0 ? "bottom" : "top");
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

    const totalHP = level === 1 ? 3 : level === 1 ? 5 : 7;
    const segmentWidth = barWidth / totalHP;

    for (let i = 0; i < enemyShipHP; i++) {
        ctx.fillStyle = "limegreen";
        ctx.fillRect(barX + i * segmentWidth, barY, segmentWidth - 1, barHeight);
    }
}

function drawEnemyLasers() {
    for (const laser of enemyLasers) {
        if (!enemyLaserImg.complete) continue;

        const angle = Math.atan2(laser.vy, laser.vx) + Math.PI / 2;

        const size = 16; // 원하는 크기 설정
        const halfSize = size / 2;

        ctx.save();
        ctx.translate(laser.x, laser.y);
        ctx.rotate(angle);
        ctx.drawImage(enemyLaserImg, -halfSize, -halfSize, size, size);
        ctx.restore();
    }
}

function getLaserCooldownByLevel() {
    const gameTime = scrollY * 60 / canvas.height; // 약간의 보정으로 경과 시간 추정 (단위: 초)

    if (level === 1) return timeBalance * 3;
    if (level === 2) return timeBalance * 2;
    if (level === 3) return timeBalance;

    // Infinity Mode
    if (gameTime < 60) return timeBalance * 3;
    else if (gameTime < 120) return timeBalance * 2;
    else return timeBalance;
}

function getAsteroidIntervalByLevel() {
    return getLaserCooldownByLevel() * 1.7;
}

function setAsteroidExplosionFrames() {
    asteroidExplosionFrames = [];
    for (let i = 1; i <= 8; i++) {
        const img = new Image();
        img.src = `src/asteroid/explosion_asteroid_${i}.png`;
        asteroidExplosionFrames.push(img);
    }
}

function spawnAsteroidExplosion(x, y) {
    asteroidExplosions.push({
        x: x - 50, // 운석 폭발 크기(100x100) 중심 조정
        y: y - 50,
        frame: 0
    });
}

function drawAsteroidExplosions() {
    for (let i = asteroidExplosions.length - 1; i >= 0; i--) {
        const exp = asteroidExplosions[i];
        const frameIndex = Math.floor(exp.frame);
        const img = asteroidExplosionFrames[frameIndex];

        if (img && img.complete) {
            ctx.drawImage(img, exp.x, exp.y, 120, 120); // 운석 크기에 맞춘 폭발 크기
        }

        exp.frame += 0.2; // 애니메이션 속도 (기존 공 폭발과 동일)
        if (exp.frame >= asteroidExplosionFrames.length) {
            asteroidExplosions.splice(i, 1);
        }
    }
}

const reflexSfx = new Audio("src/sfx/blop.mp3");
const ballImg = new Image();
let ballType = localStorage.getItem("ballType") || "blue";
ballImg.src = `src/ball/${ballType}.png`;

let lastFireTime = 0;
const FIRE_COOLDOWN = 100;

const ballSize = 16;

let balls = []; // 배열로 변경
let maxBalls = 1; // 최대 발사 가능 공 개수, 초기값 1
let speedMultiplier = 1; // 공 속도 배율, 기본값 1
let explosions = [];
let explosionFrames = [];
setExplosionFrames();

function getMaxBalls() {
    return maxBalls;
}
window.getMaxBalls = getMaxBalls;

// maxBalls 증가 함수 추가
function increaseMaxBalls() {
    maxBalls = Math.min(maxBalls + 1, 4); // 최대 4개
}
window.increaseMaxBalls = increaseMaxBalls;

document.addEventListener('ballTypeChanged', function (event) {
    ballType = event.detail.ballType;
    ballImg.src = `src/ball/${ballType}.png`;
    setExplosionFrames();
});

function setExplosionFrames() {
    explosionFrames = [];
    for (let i = 0; i < 9; i++) {
        const img = new Image();
        img.src = `src/vfx/explosion_${ballType}_${i + 1}.png`;
        explosionFrames.push(img);
    }
}

function spawnExplosion(x, y) {
    explosions.push({
        x: x - ballSize / 2,
        y: y - ballSize / 2,
        frame: 0
    });
}

function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        const frameIndex = Math.floor(exp.frame);
        const img = explosionFrames[frameIndex];

        if (img && img.complete) {
            ctx.drawImage(img, exp.x, exp.y, 64, 64);
        }

        exp.frame += 0.2;

        if (exp.frame >= explosionFrames.length) {
            explosions.splice(i, 1);
        }
    }
}

function fireBall() {
    const now = performance.now();
    if (now - lastFireTime < FIRE_COOLDOWN) return;   // 너무 빠르면 무시
    if (balls.length >= maxBalls) return;

    const centerX = shipX + shipWidth / 2;
    const centerY = shipY;

    balls.push({
        x: centerX - ballSize / 2,
        y: centerY - ballSize / 2,
        vx: 0,
        vy: -1,
        prevX: centerX - ballSize / 2,
        prevY: centerY - ballSize / 2
    });
    lastFireTime = now;       // 시간 갱신
}

function reflexPlay() {
    reflexSfx.volume = localStorage.getItem("sfx-volume") / 100;
    reflexSfx.currentTime = 0;
    reflexSfx.play().then();
}

function updateBall(delta) {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        if (!ball) continue;

        // 프레임 시작 시 충돌 플래그 초기화
        ball.collided = false;

        const speed = 400 * speedMultiplier;

        ball.prevX = ball.x;
        ball.prevY = ball.y;

        ball.x += ball.vx * speed * delta;
        ball.y += ball.vy * speed * delta;

        if (ball.x <= 0 || ball.x + ballSize >= canvas.width) {
            ball.vx *= -1;
            if (ball.x <= 0) {
                ball.x = 0;
            } else {
                ball.x = canvas.width - ballSize;
            }
        }
        if (ball.y <= 0) {
            ball.y = 0;
            ball.vy *= -1;
        }

        if (ball.y >= canvas.height) {
            balls.splice(i, 1);
            if (balls.length === 0) {
                subtractLives();
            }
            continue;
        }

        if (ballHitsBar(ball)) {
            const ballCenterX = ball.x + ballSize / 2;
            const relativeX = (ballCenterX - bar.x) / bar.width;
            const offset = (relativeX - 0.5) * 2;

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const angle = offset * (Math.PI / 3);

            ball.vx = Math.sin(angle) * speed;
            ball.vy = -Math.cos(angle) * speed;
            reflexPlay();
        }

        isBallHitEnemyShip(ball);
    }

}

function ballHitsBar(ball) {
    const cx = ball.x + ballSize / 2;
    const cy = ball.y + ballSize / 2;
    return (
        cx > bar.x &&
        cx < bar.x + bar.width &&
        cy > bar.y &&
        cy < bar.y + bar.height
    );
}

function drawBall() {
    for (const ball of balls) {
        if (ball && ballImg.complete) {
            ctx.drawImage(ballImg, ball.x, ball.y, ballSize, ballSize);
        }
    }
}

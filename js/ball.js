const reflexSfx = new Audio("src/sfx/blop.mp3");

let balls = []; // 배열로 변경
let maxBalls = 1; // 최대 발사 가능 공 개수, 초기값 1
let speedMultiplier = 1; // 공 속도 배율, 기본값 1

function fireBall() {
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
}

function reflexPlay() {
    reflexSfx.volume = localStorage.getItem("sfx-volume") / 100;
    reflexSfx.currentTime = 0;
    reflexSfx.play();
}

function updateBall(delta) {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        if (!ball) continue;

        const speed = 400 * speedMultiplier;

        ball.prevX = ball.x;
        ball.prevY = ball.y;

        ball.x += ball.vx * speed * delta;
        ball.y += ball.vy * speed * delta;

        if (ball.x <= 0 || ball.x + ballSize >= canvas.width) {
            ball.vx *= -1;
        }
        if (ball.y <= 0) {
            ball.y = 0;
            ball.vy *= -1;
        }

        if (ball.y >= canvas.height) {
            balls.splice(i, 1);
            subtractLives(); // isFire 제거
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


const reflexSfx = new Audio("src/sfx/blop.mp3");

function fireBall() {
    const centerX = shipX + shipWidth / 2;
    const centerY = shipY;

    const speed = 5;

    ball = {
        x: centerX - ballSize / 2,
        y: centerY - ballSize / 2,
        vx: 0,           // x축 이동 없음
        vy: -speed,      // 위쪽으로 고정 발사
        prevX: centerX - ballSize / 2,
        prevY: centerY - ballSize / 2
    };
}

function reflexPlay() {
    reflexSfx.volume = localStorage.getItem("sfx-volume") / 100;
    reflexSfx.currentTime = 0;
    reflexSfx.play();
}

function updateBall() {
    if (!ball) return;

    ball.prevX = ball.x;
    ball.prevY = ball.y;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= 0 || ball.x + ballSize >= canvas.width) {
        ball.vx *= -1;
    }
    if (ball.y <= 0) {
        ball.vy *= -1;
    }

    if (ball.y >= canvas.height) {
        ball = null;
        if (subtractLives())
            isStart = false;
        return;
    }

    if (ballHitsBar(ball)) {
        const ballCenterX = ball.x + ballSize / 2;

        const relativeX = (ballCenterX - bar.x) / bar.width; // 0~1
        const offset = (relativeX - 0.5) * 2; // -1 ~ 1

        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const angle = offset * (Math.PI / 3); // -60도 ~ +60도 제한

        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.cos(angle) * speed; // 항상 위쪽으로 반사
        reflexPlay();
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
    if (ball && ballImg.complete) {
        ctx.drawImage(ballImg, ball.x, ball.y, ballSize, ballSize);
    }
}
const fall_point = [0, 50, 100, 150, 200, 250, 300, 350, 400];
const asteroidWidth = 100;
const asteroidHeight = 100;
const asteroidSpeed = 0.5;
const mapHeight = canvas.height;

const asteroidImages = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/asteroid/asteroid_${i}.png`;
    asteroidImages.push(img);
}

let asteroids = [];

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
            ball.vy *= -1; // 반사
            asteroids.splice(i, 1);
            continue;
        }

        // 바닥에 운석 충돌
        if (asteroid.y > canvas.height){
            asteroids.splice(i, 1);
            //subtractLives();
            return;
        }
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

setInterval(() => {
    const randomIndex = Math.floor(Math.random() * fall_point.length);
    createAsteroid(fall_point[randomIndex]);
}, 5000);

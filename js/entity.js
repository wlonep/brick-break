
const fall_point = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];
const asteroidWidth = 50;
const asteroidHeight = 50;
const asteroidSpeed = 2;
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
    asteroids.push({
        x: x,
        y: 0,
        width: asteroidWidth,
        height: asteroidHeight,
        img: asteroidImages[spriteIndex]
    });
}

function updateAsteroid(){
    for (let i = asteroids.length - 1 ; i >= 0 ; i--){
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;

        //공 & 운석 충돌
        if (ball && isColliding(ball, asteroid)){
            //ballhitsAsteroid()
            asteroids.splice(i, 1);
            continue;
        }

        //바닥에 운석 충돌
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
        if (!asteroid.img) continue;
        if (!asteroid.img.complete) continue;

        ctx.drawImage(asteroid.img, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
    }
}

setInterval(() => {
    const randomIndex = Math.floor(Math.random() * fall_point.length);
    createAsteroid(fall_point[randomIndex]);
}, 1000);
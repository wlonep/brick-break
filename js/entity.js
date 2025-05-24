
const fall_point = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];
const asteroidWidth = 50;
const asteroidHeight = 50;
const asteroidSpeed = 2;
const mapHeight = canvas.height;

let asteroids = [];

function createAsteroid(x){
    asteroids.push({
        x: x,
        y: 0,
        width: astroidWidth,
        height: asteroidHeight
    });
}

function updateAsteroid(){
    for (let i = asteroids.length - 1 ; i >= 0 ; i--){
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;

        //공 & 운석 충돌
        if (ball && isColliding(ball, asteroid)){
            asteroids.splice(i, 1);
            //ballhitsAsteroid()
            continue;
        }

        //바닥에 운석 충돌
        if (asteroid.y > mapHeight){
            asteroids.splice(i, 1);
            //게임 종료 함수
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

}

setInterval(() => {
    const randomIndex = Math.floor(Math.random() * fall_point.length);
    createAsteroid(fall_point[randomIndex]);
}, 1000);
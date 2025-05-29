const breakSfx = new Audio("src/sfx/pling.mp3");

//운석 최초 스폰 시점에 2개 이상 떨어지던 문제 수정
let asteroidSpawnTimer = -1;  // START 후 1초 지연
const asteroidSpawnInterval = 5; // 5초 간격

const shrinkRatio = 0.8; // 적 우주선 & 운석 히트박스 비율 (0.8 = 이미지의 80%가 히트박스)

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
let enemyShipHP = Infinity;
let enemyShipAlive = true;

const itemTypes = ['ammo', 'energy', 'health', 'rockets'];
//어진: 아이템 종류는 정한게 없어서 일단 icon 에셋 파일에 있는걸로 사용할게
//아래는 대충 예시고, 구현 편한 기능으로 효과 넣으면 될 듯??
//ammo: 공 한개 더 발사가능? / energy: 공 관통력 +1 / health: 목숨 +1 / rocket: n초동안 공 속도 증가?
const itemWidth = 30;
const itemHeight = 30;
const itemSpeed = 100;
const itemDropChance = 1;

const asteroidImages = []; //행성 이미지 배열
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/asteroid/asteroid_${i}.png`;
    asteroidImages.push(img);
}
const itemImages = {}; //아이템 이미지 객체
itemTypes.forEach(type=>{
    itemImages[type] = new Image();
    itemImages[type].src = `src/icons/${type}.png`;
})

let asteroids = []; //현재 화면에 표시된 행성들 배열
let items = []; //현재 화면에 표시되는 아이템들 배열

function resetEntities() {
    asteroids = [];
    items=[];
    enemyShipInitialized = false;
    enemyShipX = 0;
    enemyShipY = 0;
}

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

function createItem(x, y){
    const randomType = itemTypes[Math.floor(Math.random()*itemTypes.length)];

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


function updateAsteroid(){
    for (let i = asteroids.length - 1 ; i >= 0 ; i--){
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;
        asteroid.angle += asteroid.rotationSpeed; // 회전 업데이트

        // 공 & 운석 충돌
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

        // 바닥에 운석 충돌
        if (asteroid.y > canvas.height){
            asteroids.splice(i, 1);
            subtractLives();
            return;
        }
    }
}

function updateItems(delta){
    for(let i = items.length-1; i>=0; i--){
        const item = items[i];
        item.y+=itemSpeed*delta;

        //바닥에 아이템 충돌
        if(item.y > canvas.height){
            items.splice(i, 1);
            continue;
        }

        //플레이어 바와 아이템 충돌
        //어진: 우주선이랑 충돌할 때 상호작용하도록 하는게 나을까요? 우주선이 막대때문에 좌우 끝까진 못가서 일단 막대로 했습니다.
        //막대로 합시다 ㄱㄱ 너 말대로 우주선이 다 커버 못하기도 하고 난이도 너무 높을 듯
        if(itemHitsBar(item)){
            applyItemEffect(); //아이템을 먹었을때 동작하는 함수
            const itemSfx = new Audio("src/sfx/pling.mp3");
            itemSfx.volume = localStorage.getItem("sfx-volume") / 100
            itemSfx.play();

            items.splice(i, 1);
        }
    }
}

function itemHitsBar(item){
    return (
        (item.x < bar.x+bar.width && item.x + item.width > bar.x) &&
        (item.y < bar.y + bar.height && item.y + item.height > bar.y)
    )
}
function applyItemEffect(){
    //어진: 여기에 아이템 효과 함수들 작성하면 됩니다.
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

function isBallHitEnemyShip(ball) {
    if (!enemyShipAlive) return false;

    const hitW = enemyShipWidth * shrinkRatio;
    const hitH = enemyShipHeight * shrinkRatio;

    const ex = enemyShipX + (enemyShipWidth - hitW) / 2;
    const ey = enemyShipY + (enemyShipHeight - hitH) / 2;

    const ballCx = ball.x + ballSize / 2;
    const ballCy = ball.y + ballSize / 2;

    const hit =
        ballCx > ex &&
        ballCx < ex + hitW &&
        ballCy > ey &&
        ballCy < ey + hitH;

    if (hit) {
        const dir = getCollisionDirection(ball, {
            x: enemyShipX,
            y: enemyShipY,
            width: enemyShipWidth,
            height: enemyShipHeight
        });

        if (dir === "left" || dir === "right") ball.vx *= -1;
        else ball.vy *= -1;

        reflexPlay();

        if (enemyShipHP !== Infinity) {
            enemyShipHP--;
            if (enemyShipHP <= 0) {
                enemyShipAlive = false;
            }
        }
    }

    return hit;
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

function drawItems(){
    for(const item of items){
        if (!item.img || !item.img.complete) continue;

        ctx.drawImage(
            item.img,
            item.x,
            item.y,
            item.width,
            item.height
        )
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
    if (enemyShipAlive && enemyShipImg.complete) {
        ctx.drawImage(enemyShipImg, enemyShipX, enemyShipY, enemyShipWidth, enemyShipHeight);
    }
}

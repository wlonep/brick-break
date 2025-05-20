const canvas = $('#game-canvas')[0];
const ctx = canvas.getContext('2d');

let bgImg1 = new Image();
bgImg1.src = 'src/background/stage_1_1.png';
let bgImg2 = new Image();
bgImg2.src = 'src/background/stage_1_2.png';

const shipImg = new Image();
shipImg.src = 'src/ship/ship_green.png';

const ballImg = new Image();
ballImg.src = 'src/ball/ball.png';

let scrollY = 0;
let stopScroll = false;
let shipX = 0;
let shipY = 0;
const shipWidth = 64;
const shipHeight = 64;
const ballSize = 16;
let ball = null;
const bar = {
    width: shipWidth * 2,
    height: 8,
    x: 0,
    y: 0
};

function initCanvas() {
    const displayHeight = $(window).height();

    canvas.width = 500;
    canvas.height = displayHeight;

    canvas.style.width = 500 + "px";
    canvas.style.height = displayHeight - 20 + "px";
    shipY = canvas.height * 0.95 - shipHeight;

    bar.x = shipX;
    bar.y = shipY + shipHeight - 5;
}

function drawBackground() {
    const h1 = bgImg1.height;
    const h2 = bgImg2.height;

    if (!bgImg1.complete || !bgImg2.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // case 1: scrollY < h1 → stage_1 보여주기
    if (scrollY < h1) {
        ctx.drawImage(bgImg1, 0, scrollY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

        // stage_2가 곧 들어올 경우, 겹쳐서 미리 그려주기
        if (scrollY + canvas.height > h1) {
            const remaining = scrollY + canvas.height - h1;
            ctx.drawImage(bgImg2, 0, 0, canvas.width, remaining, 0, canvas.height - remaining, canvas.width, remaining);
        }
    }
    // case 2: scrollY >= h1 → stage_2 전면
    else {
        const offsetY = scrollY - h1;
        ctx.drawImage(bgImg2, 0, offsetY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }

    if (stopScroll) return;
    scrollY += 0.5;

    const totalHeight = h1 + h2 - canvas.height;
    if (scrollY >= totalHeight) {
        stopScroll = true;
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawShipBar();
    drawShip();
    updateBall();
    drawBall();
    requestAnimationFrame(draw);
}

function eventHandler() {
    $(canvas).on('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        // 마우스를 bar 중심에 맞춤
        let newBarX = mouseX - bar.width / 2;

        // 경계 제한
        if (newBarX < 0) newBarX = 0;
        if (newBarX + bar.width > canvas.width) newBarX = canvas.width - bar.width;

        // 바 위치 지정
        bar.x = newBarX;

        // 우주선은 바의 중심에 위치
        shipX = bar.x + (bar.width - shipWidth) / 2;
    });
    $(canvas).on('mousedown', function (e) {
        e.preventDefault();
        fireBall();
    });
}

function startGame() {
    initCanvas();
    eventHandler();
    draw();
}

Promise.all([
    new Promise(res => bgImg1.onload = res),
    new Promise(res => bgImg2.onload = res),
    new Promise(res => shipImg.onload = res),
]).then(startGame);

$(window).on('resize', () => initCanvas());



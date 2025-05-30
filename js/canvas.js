const canvas = $('#game-canvas')[0];
const ctx = canvas.getContext('2d');
let lastTime = performance.now();
let animationFrame = null;

let level = 0;
let lives = 5;
let isPlaying = false;

let bgImg1 = new Image();
let bgImg2 = new Image();
bgImg1.onerror = () => {
    bgImg1.src = "src/background/callback.png";
};
bgImg2.onerror = () => {
    bgImg2.src = "src/background/callback.png";
};

const ballImg = new Image();
const ballType = localStorage.getItem("ballType") || "blue";
ballImg.src = `src/ball/${ballType}.png`;

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
    height: 12, // 8 -> 12
    x: 0,
    y: 0
};

function initCanvas() {
    const displayHeight = $(window).height();

    canvas.width = 500;
    canvas.height = displayHeight;

    canvas.style.width = 500 + "px";
    canvas.style.height = displayHeight - 65 + "px";
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

    if (stopScroll || !isPlaying) return;
    scrollY += 0.5;

    const totalHeight = h1 + h2 - canvas.height;
    if (scrollY >= totalHeight) {
        stopScroll = true;
    }
}


function draw(timestamp) {
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    drawShipBar();
    drawShip();
    updateBall(delta);
    if (isPlaying) {
        updateAsteroidSpawn(delta);
        updateAsteroid();
        updateEnemyShipInvincibility(delta);
        updateItems(delta); 
        updateEnemyShip();
        drawBall();
        drawAsteroids();
        drawItems();
        drawEnemyShip();
    }
    animationFrame = requestAnimationFrame(draw);
}

function eventHandler() {
    $(canvas).on('mousemove', function (e) {
        if (!isPlaying) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        // 마우스를 bar 중심에 맞춤
        let newBarX = mouseX - bar.width / 2;

        // 경계 제한
        if (newBarX < 0) newBarX = 0;
        if (newBarX + bar.width > canvas.width) newBarX = canvas.width - bar.width;

        // 바 위치 지정
        bar.x = newBarX;

        // 우주선 배치
        shipX = bar.x + (bar.width - shipWidth) / 2;
    });
    $(canvas).on('mousedown', function (e) {
        e.preventDefault();
        if (isPlaying) {
            fireBall();
        }
    });
}

function subtractLives() {
    lives--;
    $("#health").empty().append("목숨: ");
    for (let i = 0; i < lives; i++) {
        const heart = new Image();
        heart.src = "src/icons/heart.png";
        $("#health").append(heart);
    }
    if (lives === 0) return defeat();
    return true;
}

function defeat() {
    isPlaying = false;
    const btnArea = $("<div id='status-btn-wrapper'/>");
    btnArea.append(
        $("<button class='status-btn'>YES</button>"),
        $("<button class='status-btn'>NO</button>")
    );
    let countdown = 10;
    $("#status").html("<h1 class='title'>GAME OVER</h1>").css("display", "flex")
        .append("<div class='status-small'>CONTINUE?</div>")
        .append(btnArea).on("click", "button", function () {
        clearInterval(timer);
        $("#status-btn-wrapper").remove();
        $("#status").off("click");
        resetGame();
        if ($(this).text() === "YES") {
            init_GameLevel(level)
        } else {
            goMenu();
        }
    })
        .append('<br/>')
        .append(`<div class='status-small'>${countdown}</div>`);

    const timer = setInterval(() => {
        countdown--;
        $(".status-small").last().text(countdown);
        if (countdown < 0) {
            clearInterval(timer);
            $("#status-btn-wrapper").remove();
            $("#status").off("click");
            resetGame();
            goMenu();
        }
    }, 1000);
}

function victory() {
    showStory("ending", function () {
        alert("축하합니다! 게임을 클리어했습니다!");
        goMenu();
    });
}

function resetGame() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    lives = 5;
    $("#health").empty().append("목숨: ");
    for (let i = 0; i < lives; i++) {
        const heart = new Image();
        heart.src = "src/icons/heart.png";
        $("#health").append(heart);
    }
    isPlaying = false;
    scrollY = 0;
    stopScroll = false;
    shipX = 0;
    shipY = 0;
    balls = []; // 배열로 변경
    maxBalls = 1; // maxBalls 초기화
    speedMultiplier = 1; // speedMultiplier 초기화
    resetEntities();

    initCanvas();
    $("#status").html("").hide();
}

function startGame() {
    // todo: 점수, 목숨, 퍼즈 기능 추가

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    $("#game-info")
        .html('<div id="pause-btn"><i class="fa-solid fa-pause"></i></div>')
        .off('click', '#pause-btn > i')
        .on('click', '#pause-btn > i', pauseGame)
        .append('<div id="health">목숨: </div><div id="score">점수: 0</div>')
        .append('<br/><br/><div id="item-status"></div>');
    for (let i = 0; i < lives; i++) {
        const heart = new Image();
        heart.src = "src/icons/heart.png";
        $("#health").append(heart);
    }

    initCanvas();
    eventHandler();
    lastTime = performance.now();
    draw();
    startCountdown();
}

function pauseGame() {
    clickButton();
    isPlaying = false;
    $("#pause-btn > i").removeClass("fa-pause").addClass("fa-play");

    $("#status").html("<h1 class='title'>PAUSED</h1>").css("display", "flex")
        .append('<div id="pause-wrapper">' +
            '<i class="fa-solid fa-rotate-right"></i>' +
            '<i class="fa-solid fa-list-ul"></i>' +
            '<i class="fa-solid fa-gear"></i></div>' +
            '<div id="resume-btn">RESUME</div>')
        .off('click', '#pause-wrapper > i')
        .on('click', '#pause-wrapper > i', function () {
            clickButton();
            const classes = this.classList;
            if (classes.contains("fa-gear")) {
                openPopupSettings();
            } else if (classes.contains("fa-rotate-right")) {
                resetGame();
                init_GameLevel(level);
            } else if (classes.contains("fa-list-ul")) {
                resetGame();
                openGameMenu();
            }
        })
        .off('click', '#resume-btn')
        .on('click', '#resume-btn', function () {
            clickButton();
            $("#pause-btn > i").removeClass("fa-play").addClass("fa-pause");
            lastTime = performance.now();
            startCountdown();
        });
}

function startCountdown() {
    bar.x = canvas.width / 2 - bar.width / 2;
    shipX = bar.x + (bar.width - shipWidth) / 2;

    let count = 5;
    const countFunction = () => {
        if (count > 0) {
            $("#status").html(count).css("display", "flex");
            count--;
        } else if (count === 0) {
            $("#status").html("GAME START").css("display", "flex");
            count--;
        } else {
            clearInterval(countdown);
            $("#status").html("").css("display", "none");
            isPlaying = true;
            lastTime = performance.now();
        }
    }
    countFunction();
    const countdown = setInterval(countFunction, 1000);
}

function init_GameLevel(lv) {
    level = lv;

    bgImg1.src = `src/background/stage_${level}_1.png`;
    bgImg2.src = `src/background/stage_${level}_2.png`;

    // 적 우주선 에셋 종류 설정
    enemyShipImg.src = `src/ship/enemy_${level}.png`;
    enemyShipY = canvas.height * 0.1;
    enemyShipX = canvas.width / 2 - enemyShipWidth / 2;

    // 적 우주선 체력
    enemyShipHP = (level === 1) ? 3 : (level === 2) ? 5 : (level === 3) ? 7 : Infinity;
    enemyShipAlive = true;

    startGame();
}

$(window).on('resize', () => initCanvas());
window.init_GameLevel = init_GameLevel;



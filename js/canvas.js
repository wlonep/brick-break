const canvas = $('#game-canvas')[0];
const ctx = canvas.getContext('2d');
let lastTime = performance.now();
let animationFrame = null;

let level = 0;
let lives = 5;
let isFire = false;
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
    height: 8,
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

    //어진: 여기 주석처리 돼있던데 테스트한다고 잠깐 풀었어용
    drawShipBar();
    drawShip();
    updateBall(delta);
    if (isPlaying) {
        updateAsteroid();
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

        // 우주선은 바의 중심에 위치
        shipX = bar.x + (bar.width - shipWidth) / 2;
    });
    $(canvas).on('mousedown', function (e) {
        e.preventDefault();
        if (!isFire && isPlaying) {
            fireBall();
            isFire = true;
        }
    });
}

function subtractLives() {
    lives--;
    if (lives === 0) return defeat();
    return true;
}

function finishGame() {

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
    lives = 5;
    isFire = false;
    isPlaying = false;
    scrollY = 0;
    stopScroll = false;
    shipX = 0;
    shipY = 0;
    ball = null;
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

    $("#game-info").append('<div id="health">목숨: </div><div id="score">점수: 0</div>');
    for (let i = 0; i < lives; i++) {
        const heart = new Image();
        heart.src = "src/icons/heart.png";
        $("#health").append(heart);
    }

    initCanvas();
    eventHandler();
    lastTime = performance.now();
    draw();

    isPlaying = true; // 디버깅용 - 카운트다운 삭제
    /*let count = 6;
    const countdown = setInterval(() => {
        if (count > 1) {
            $("#status").html(count - 1).css("display", "block");
            count--;
        } else if (count === 1) {
            $("#status").html("GAME START").css("display", "block");
            count--;
        } else {
            clearInterval(countdown);
            $("#status").html("").css("display", "none");
            isPlaying = true;
        }
    }, 1000);*/
}

function init_GameLevel(lv) {
    level = lv;
    bgImg1.src = `src/background/stage_${level}_1.png`;
    bgImg2.src = `src/background/stage_${level}_2.png`;

    enemyShipImg.src = `src/ship/enemy_${level}.png`;

    enemyShipY = canvas.height * 0.1;   //이거 여따쓰면 많이 별로인가요? <-- 웬만하면 다른 파일에 넣는 게 나을 듯
    enemyShipX = canvas.width / 2 - enemyShipWidth / 2;

    //어진: 여기서 게임 난이도, 블록 배치, 속도 
    //설정하고 게임시작하면 되지 않을까?

    startGame();
}

$(window).on('resize', () => initCanvas());
window.init_GameLevel = init_GameLevel;



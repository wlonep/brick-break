const canvas = $('#game-canvas')[0];
const ctx = canvas.getContext('2d');
let lastTime = performance.now();
let animationFrame = null;
let isCheat = false;

let level = 0;
let lives = 5;
let isPlaying = false;
let score = 0;

let bgImg1 = new Image();
let bgImg2 = new Image();
bgImg1.onerror = () => {
    bgImg1.src = "src/background/callback.png";
};
bgImg2.onerror = () => {
    bgImg2.src = "src/background/callback.png";
};

let scrollY = 0;
let stopScroll = false;
let shipX = 0;
let shipY = 0;
const shipWidth = 64;
const shipHeight = 64;
const bar = {
    width: shipWidth * 2,
    height: 12,
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
    const totalHeight = h1 + h2;

    if (!bgImg1.complete || !bgImg2.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let localScrollY = level === 4 ? scrollY % totalHeight : scrollY;
    let drawY = 0;
    let scrollOffset = localScrollY;

    while (drawY < canvas.height) {
        const img = scrollOffset < h1 ? bgImg1 : bgImg2;
        const imgHeight = (img === bgImg1) ? h1 : h2;
        const offsetY = scrollOffset % imgHeight;
        const drawHeight = Math.min(canvas.height - drawY, imgHeight - offsetY);

        ctx.drawImage(
            img,
            0, offsetY, canvas.width, drawHeight,
            0, drawY, canvas.width, drawHeight
        );

        scrollOffset += drawHeight;
        drawY += drawHeight;
    }

    if (stopScroll || !isPlaying) return;
    scrollY += 2;
    if (isCheat) scrollY += 20;

    if (level !== 4) {
        const maxScroll = h1 + h2 - canvas.height;
        if (scrollY >= maxScroll) {
            stopScroll = true;

            if (isCheat) {
                setInterval(() => {
                    resetEntities();
                    enemyShipAlive = false;
                }, 500);
            }
        }
    }
}

function draw(timestamp) {
    if (stopScroll && !enemyShipAlive && asteroids.length === 0 && lives > 0) {
        isPlaying = false;
        return victory();
    }

    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    drawShipBar();
    drawShip();
    drawBall();
    drawAsteroids();
    drawItems();
    drawEnemyShip();
    drawEnemyLasers();
    drawExplosions();
    if (isPlaying) {
        updateAsteroidSpawn(delta);
        updateAsteroid(); // 운석과 공의 충돌 처리 먼저
        updateBall(delta); // 충돌 후 공 위치 업데이트
        updateEnemyShipInvincibility(delta);
        updateItems(delta);
        updateEnemyShip();
        updateEnemyLasers(delta);
    }
    animationFrame = requestAnimationFrame(draw);
}

function eventHandler() {
    $(canvas).on('mousemove', function (e) {
        if (!isPlaying) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        let newBarX = mouseX - bar.width / 2;

        if (newBarX < 0) newBarX = 0;
        if (newBarX + bar.width > canvas.width) newBarX = canvas.width - bar.width;

        bar.x = newBarX;
        shipX = bar.x + (bar.width - shipWidth) / 2;
    });
    $(canvas).on('click', function (e) {
        e.preventDefault();
        if (isPlaying) {
            fireBall();
        }
    });
}

function subtractLives() {
    if (isCheat) return true;

    const subtractSFX = new Audio("src/sfx/subtract.mp3");
    subtractSFX.volume = localStorage.getItem("sfx-volume") / 100;
    subtractSFX.currentTime = 0;
    subtractSFX.play().then();
    lives--;
    displayLives();
    if (lives === 0) return defeat();
    return true;
}

function displayLives() {
    const health = $("#health");

    health.empty().append("목숨: ");
    for (let i = 0; i < lives; i++) {
        const heart = new Image();
        heart.src = "src/icons/heart.png";

        heart.classList.add("blink");
        void heart.offsetWidth;

        health.append(heart);
    }
}

function defeat() {
    isPlaying = false;

    const loseSFX = new Audio("src/sfx/lose.mp3");
    loseSFX.volume = localStorage.getItem("sfx-volume") / 100;
    loseSFX.currentTime = 0;
    loseSFX.play().then();

    // #status 캐싱 및 초기화
    const $status = $("#status")
        .removeClass("scoreboard") // 점수판 스타일 제거
        .removeAttr("style") // 모든 인라인 스타일 제거
        .html("");

    const btnArea = $("<div id='status-btn-wrapper'/>");
    btnArea.append(
        $("<button class='status-btn'>YES</button>"),
        $("<button class='status-btn'>NO</button>")
    );
    let countdown = 10;
    $status
        .html("<h1 class='title'>GAME OVER</h1>")
        .css("display", "flex")
        .append(`<div class='status-small'>점수: ${score}</div>`)
        .append("<div class='status-small'>REPLAY?</div>")
        .append(btnArea)
        .on("click", "button", function () {
            clearInterval(timer);
            $("#status-btn-wrapper").remove();
            $status.off("click");
            resetGame();
            if ($(this).text() === "YES") {
                init_GameLevel(level);
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
            $status.off("click");
            resetGame();
            goMenu();
        }
    }, 1000);
}

function victory() {
    const winSFX = new Audio("src/sfx/win.mp3");
    winSFX.volume = localStorage.getItem("sfx-volume") / 100;
    winSFX.currentTime = 0;
    winSFX.play().then();

    // 현재 레벨 클리어 상태 저장
    localStorage.setItem(`level-${level}-cleared`, "true");

    // 현재 점수 저장
    const finalScore = score;

    // 레벨 1, 2, 3 모두 클리어 여부 확인
    const allCleared =
        localStorage.getItem("level-1-cleared") === "true" &&
        localStorage.getItem("level-2-cleared") === "true" &&
        localStorage.getItem("level-3-cleared") === "true";

    // #status 캐싱
    const $status = $("#status");

    // #status를 #game-wrapper 외부로 이동
    $status.appendTo("#game");

    // resetGame 호출
    resetGame();

    // 점수판 표시 함수 정의
    function showScoreboard() {
        const btnArea = $("<div id='status-btn-wrapper'/>");
        const isLevel4 = level === 4;
        let timer = null; // timer 선언
        let countdown = 10; // 10초로 설정

        if (!isLevel4) {
            const yesText = level === 3 ? "무한 모드로" : "다음 단계로";
            btnArea.append(
                $(`<button class='btn'>${yesText}</button>`).off("click").on("click", function () {
                    if (timer) clearInterval(timer);
                    $status.appendTo("#game-wrapper").html("").hide();
                    const nextLevel = level === 3 ? 4 : level + 1;
                    init_GameLevel(nextLevel);
                })
            );
        }

        btnArea.append(
            $("<button class='btn'>단계 선택</button>").off("click").on("click", function () {
                if (timer) clearInterval(timer);
                $status.appendTo("#game-wrapper").html("").hide();
                if (typeof openGameMenu === "function") {
                    openGameMenu();
                } else {
                    goMenu();
                }
            })
        );

        setTimeout(() => {
            $status
                .removeAttr("style") // 모든 인라인 스타일 제거
                .removeClass() // 기존 클래스 제거
                .addClass("scoreboard") // 칠판 스타일 적용
                .html(`<h1 class='title'>레벨 ${level} 클리어!</h1>`)
                .css("display", "flex")
                .append(`<div class='status-small'>점수: ${finalScore}</div>`)
                .append(`<div class='status-small'>최고 점수: ${localStorage.getItem(`level-${level}-score`) || 0}</div>`)
                .append(btnArea)
                .append(`<div class='status-small'>자동 전환까지 ${countdown}초</div>`);

            // 카운트다운 타이머 시작
            timer = setInterval(() => {
                countdown--;
                $(".status-small").last().text(`자동 전환까지 ${countdown}초`);
                if (countdown < 0) {
                    clearInterval(timer);
                    $status.appendTo("#game-wrapper").html("").hide();
                    if (level === 3) {
                        if (typeof openGameMenu === "function") {
                            openGameMenu();
                        } else {
                            goMenu();
                        }
                    } else {
                        const nextLevel = level + 1;
                        init_GameLevel(nextLevel);
                    }
                }
            }, 1000);
        }, 1000); // 스토리 후 1초 지연
    }

    // 모든 레벨 클리어 시 엔딩 스토리 표시 후 점수판 표시
    if (allCleared && level === 3) {
        setTimeout(() => {
            showStory("ending", showScoreboard);
        }, 1000);
    } else {
        showScoreboard();
    }
}

function resetGame() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    lives = 5;
    displayLives();
    if (localStorage.getItem(`level-${level}-score`) < score) {
        localStorage.setItem(`level-${level}-score`, score);
    }
    score = 0;
    isPlaying = false;
    scrollY = 0;
    stopScroll = false;
    shipX = 0;
    shipY = 0;
    balls = [];
    maxBalls = 1;
    speedMultiplier = 1;
    explosions = [];
    resetEntities();

    initCanvas();
    $("#game-info").html("").hide();
    $("#game-wrapper").hide();
}

function startGame() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    // #status 초기화
    $("#status")
        .removeClass("scoreboard") // 점수판 스타일 제거
        .removeAttr("style") // 모든 인라인 스타일 제거
        .html("");

    $("#game-info").css({"display": "flex"})
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

    const beepSFX = new Audio("src/sfx/beep.mp3");
    beepSFX.volume = localStorage.getItem("sfx-volume") / 100;
    const startSFX = new Audio("src/sfx/start.mp3");
    startSFX.volume = localStorage.getItem("sfx-volume") / 100;
    startSFX.currentTime = 0;

    let count = 5;
    const countFunction = () => {
        if (count > 0) {
            $("#status").html(count).css("display", "flex");
            count--;
            beepSFX.currentTime = 0;
            beepSFX.play().then();
        } else if (count === 0) {
            $("#status").html("GAME START").css("display", "flex");
            count--;
            startSFX.play().then();
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

function addScore(point) {
    score += point;
    $("#score").text(`점수: ${score}`);
}

function init_GameLevel(lv) {
    $("#game-wrapper").show();
    level = lv;

    bgImg1.src = `src/background/stage_${level}_1.png`;
    bgImg2.src = `src/background/stage_${level}_2.png`;

    enemyShipImg.src = `src/ship/enemy_${level}.png`;
    enemyShipY = canvas.height * 0.1;
    enemyShipX = canvas.width / 2 - enemyShipWidth / 2;

    enemyShipHP = (level === 1) ? 3 : (level === 2) ? 5 : (level === 3) ? 7 : Infinity;
    enemyShipAlive = true;

    startGame();
}

$(window).on('resize', () => initCanvas());
window.init_GameLevel = init_GameLevel;

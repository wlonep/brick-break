let bgm;

window.onload = () => {
    bgm = new Audio("src/bgm/spaceship.mp3");
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(() => playSound());
    changeBGM(localStorage.getItem("bgm") || "spaceship");
    changeBall(localStorage.getItem("ballType") || "blue");
    changeVolume("sfx-volume");
    changeShipColor();
};

window.onclick = (e) => {
    const target = e.target;
    if (target.tagName === "BUTTON" || target.tagName === "SELECT" || target.tagName === "INPUT") {
        clickButton();
    }
}

function playSound() {
    if (!bgm) return;
    bgm.play();
    bgm.loop = true;
    changeVolume("volume");
}

function openSettings() {
    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 150, function () {
        $(this).hide();
        $("#settings")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 150);
    });
    $("#sound").val(localStorage.getItem("bgm"));
    changeVolume('volume');
    changeVolume('sfx-volume');
}

function clickButton() {
    const sfx = new Audio("src/sfx/button.mp3");
    sfx.volume = localStorage.getItem("sfx-volume") / 100;
    sfx.play().then();
}

function goMenu() {
    $("section").not("#main-menu").animate({left: "30%", opacity: "0"}, 150, function () {
        $(this).hide();
        $("#main-menu")
            .css({left: "-30%", display: "block", opacity: "0"})
            .animate({left: "0%", opacity: "1"}, 150, function () {
                startBackgroundAnimation();
            });
    });
}

function openCredit() {
    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 150, function () {
        $(this).hide();
        $("#credit")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 150);
    });
}

function openGame() {
    // 소행성 제거
    backgroundAsteroids = [];
    const container = document.getElementById("asteroid-container");
    if (container) {
        container.innerHTML = "";
    }

    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 150, function () {
        $(this).hide();
        showStory("intro", openGameMenu);
    });

    $(".planet-container").off("click").on("click", function () {
        clickButton();
        let level = $(this).index() + 1;
        //startGame_Level(level);
        showStageInfo(level, $(this));
    });
}

function showStageInfo(level, clickedObj) {
    const planet_img = clickedObj.find(".level-btn");
    if (clickedObj[0].classList.contains("locked"))
        return $("<div class='popup'>이전 단계를 먼저 완료해 주세요!</div>").appendTo("body").fadeIn(300).delay(500).fadeOut(300)

    let levels = ['EASY', 'NORMAL', "HARD", "INFINITY"];
    let level_name = ['Earth', 'Rigel', 'J1407B', 'Powehi'];
    let levelColors = ['#4CAF50', '#FFEB3B', '#FF5252', '#ef6dc3'];
    let descriptions = [
        "제노스에게 점령당한 지구입니다. 한때는 아름다운 행성이었죠.</br>지구를 되찾기 위한 첫 번째 임무를 시작하세요.",
        "강력한 중력장을 가진 리겔 행성. 제노스의 전초기지로 사용되고 있습니다. 제노스군의 약화를 위한 두 번째 임무를 시작하세요.",
        "거대한 가스 행성 J1407B. 제노스의 주요 요새가 구축되어 있는 위험한 지역입니다. 제노스의 요새를 격파하고 침공을 끝마쳐주세요.",
        "블랙홀 포웨히 근처의 제노스 최종 본거지. 시공간이 왜곡된 이곳에서 최후의 전투가 시작됩니다.</br>명심하세요, 블랙홀 안에서 벗어날 방법은 없습니다."
    ];

    // 원본 행성의 현재 위치 정보 가져오기
    const originalRect = planet_img[0].getBoundingClientRect();
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // 목표 위치 계산 (화면의 좌측 하단)
    const targetLeft = windowWidth * 0.05;
    const targetTop = windowHeight * 0.8;

    // 이미지의 중심점 계산
    const imageCenterX = originalRect.left + (originalRect.width / 2);
    const imageCenterY = originalRect.top + (originalRect.height / 2);

    //복사본 생성
    const CloneImg = planet_img.clone();

    // 레벨 선택 화면의 모든 요소를 fade out
    $("#level_menu").fadeOut(300, function () {
        CloneImg.attr('id', 'moving-planet');
        // 복사본을 body에 추가하고 초기 위치 설정

        CloneImg
            .off()
            .css({
                "position": "fixed",
                "left": imageCenterX + "px",
                "top": imageCenterY + "px",
                "transform": "translate(-50%, -50%)",
                "z-index": 900,
                "width": originalRect.width + "px",
                "height": originalRect.height + "px"
            });

        $("body").append(CloneImg); //body에 append한건 정말 어쩔수가 없었습니다..
        CloneImg
            .animate({
                "left": targetLeft + "px",
                "top": targetTop + "px",
                "width": (originalRect.width * 3.0) + "px", //사진 확대
                "height": (originalRect.height * 3.0) + "px"
            }, 800, function () {
                $("#stage_title").text(level_name[level - 1]);
                $("#stage_difficulty").text(levels[level - 1]).css({"color": levelColors[level - 1]});
                $("#stage_description").html(descriptions[level - 1]);
                $("#stage_score").text(localStorage.getItem(`level-${level}-score`) || 0);

                $("#stage_info").css({"display": "block"}).animate({"opacity": "1"}, 400);

                //버튼 이벤트 설정
                $("#start_stage").off('click').on('click', function () {
                    hideStageInfo();
                    startGame_Level(level);
                })
                $("#back_to_select").off('click').on('click', function () {
                    hideStageInfo();
                    resetPlanetSelection();
                })
            })

    });
}

function hideStageInfo() {
    $("#moving-planet").remove();
    $("#stage_info").animate({opacity: 0}, 300, function () {
        $(this).css('display', 'none');
    });
}

function resetPlanetSelection() {
    $("#moving-planet").remove();
    $("#level_menu").fadeIn(300);
    // 호버 이벤트 재설정
    planetHoverEvent();
}

function openGameMenu() {
    $(".planet-container").each(function () {
        const level = $(this).index();
        const levelBool = localStorage.getItem(`level-${level}-cleared`)
        if (levelBool) {
            $(this).removeClass("locked").find(".planet-number").text(level + 1);
        }
    })
    $("#game")
        .css({left: "20%", display: "block", opacity: "0"})
        .animate({left: "0", opacity: "1"}, 150, function () {
            $("#level_menu").css("display", "block");
            planetHoverEvent();
        });
}

function startGame_Level(level) {
    $("#level_menu").fadeOut(300, function () {
        $("#game-wrapper").fadeIn(300, function () {
            window.init_GameLevel(level);
            $("#game-canvas").css({"border": "2px solid white"})
        });
    });
}

function planetHoverEvent() {
    let levels = ['EASY', 'NORMAL', "HARD", "INFINITY"];
    let level_name = ['Earth', 'Rigel', 'J1407B', 'Powehi'];
    let levelColors = ['#4CAF50', '#FFEB3B', '#FF5252', '#ef6dc3'];

    $(".planet-container").not(".locked").off('mouseenter mouseleave')
        .mouseenter(function () {
            let levelIndex = $(this).index();
            let levelText = $(this).find(".planet-number");
            let levelImg = $(this).find(".level-btn")

            levelImg.css({
                'transform': 'scale(1.05) translateY(-5px)',
                'cursor': 'pointer'
            })
            levelText.css({
                'transform': 'scale(1.05) translateY(-5px)'
            })
            if ($(this).find(".level-class").length === 0) {
                const descript_Div = $("<div/>");
                descript_Div
                    .addClass("level-class")
                    .css("pointer-events", "none")
                    .html(`Highest Score: ${localStorage.getItem(`level-${levelIndex + 1}-score`) || 0}<br/>
                    Planet: <strong> ${level_name[levelIndex]}</strong><br/>
                    Difficulty: <strong style="color: ${levelColors[levelIndex]}">${levels[levelIndex]}<strong/>`)
                    .appendTo($(this));
            }

        })
        .mouseleave(function () {
            $(this).find(".level-btn").css({
                'transform': 'scale(1.0) translateY(5px)',
                'cursor': 'default'
            })
            $(this).find(".planet-number").css({
                'transform': 'scale(1.0) translateY(5px)'
            })
            $(this).find(".level-class").remove();
    })
}

function clearProgress() {
    // localStorage의 클리어 상태와 점수 초기화
    for (let i = 1; i <= 4; i++) {
        localStorage.removeItem(`level-${i}-cleared`);
        localStorage.removeItem(`level-${i}-score`);
    }

    $("<div class='popup'>진행 상태가 초기화되었습니다!</div>").appendTo("body").fadeIn(300).delay(500).fadeOut(300)
}
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
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        $("#settings")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 300);
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
    $("section").not("#main-menu").animate({left: "30%", opacity: "0"}, 300, function () {
        $(this).hide();
    });
    $("#main-menu")
        .css({left: "-30%", display: "block", opacity: "0"})
        .animate({left: "0%", opacity: "1"}, 300);
}

function openCredit() {
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        $("#credit")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 300);
    });
}

function openGame() {
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        showStory("intro", openGameMenu);
    });

    $(".level-btn").off("click").on("click", function () {
        clickButton();
        let level = $(this).parent().index() + 1;
        startGame_Level(level);
    })
}

function openGameMenu() {
    $("#game")
        .css({left: "20%", display: "block", opacity: "0"})
        .animate({left: "0", opacity: "1"}, 300, function () {
            //인게임은 가리고 레벨 메뉴부터 출력
            $("#game-wrapper").hide();
            $("#level_menu").css("display", "block");
            planetHoverEvent();
        });
}

function startGame_Level(level) {
    $("#level_menu").hide(300, function () {
        $("#game-wrapper").show(300, function () {
            if (window.init_GameLevel) { //근데 전역함수 써도 됨? // ㅇㅇ
                window.init_GameLevel(level);
            } else
                alert("게임 호출 실패");
        });
    });
}

function planetHoverEvent() {
    $(".level-btn").mouseenter(function () {
        $(this).css({
            'transform': 'scale(1.05) translateY(-5px)',
            'cursor': 'pointer'
        })
        $(this).prev().css({
            'transform': 'scale(1.05) translateY(-5px)'
        })
    }).mouseleave(function () {
        $(this).css({
            'transform': 'scale(1.0) translateY(5px)',
            'cursor': 'default'
        })
        $(this).prev().css({
            'transform': 'scale(1.0) translateY(5px)'
        })
    })
}
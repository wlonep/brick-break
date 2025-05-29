let bgm;

window.onload = () => {
    bgm = new Audio("src/bgm/spaceship.mp3");
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(() => playSound());
    changeBGM(localStorage.getItem("bgm") || "spaceship");
    updateBallPreview(localStorage.getItem("ballType") || "blue");
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

function changeVolume(type, volume) {
    if (!volume) volume = localStorage.getItem(type) || 30;
    localStorage.setItem(type, volume);
    const target = document.querySelector(`#${type}`);
    const color = "#FF7875";
    target.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${volume}%, #ddd ${volume}%, #ddd 100%)`;
    if (type === "volume") {
        bgm.volume = volume / 100;
    }
    target.value = volume;
}

function changeBGM(music) {
    bgm.pause();
    bgm = new Audio(`src/bgm/${music}.mp3`);
    playSound();
    document.querySelector("#sound").value = music;
    localStorage.setItem("bgm", music);
}

function openSettings() {
    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        $("#settings")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 300);
    });
}

function clickButton() {
    const sfx = new Audio("src/sfx/button.mp3");
    sfx.volume = localStorage.getItem("sfx-volume") / 100;
    sfx.play().then();
}

function goMenu() {
    $("section").not("#main-menu").animate({left: "30%", opacity: "0"}, 300, function () {
        $(this).hide();
        $("#main-menu")
            .css({left: "-30%", display: "block", opacity: "0"})
            .animate({left: "0%", opacity: "1"}, 300, function() {
                startBackgroundAnimation();
            });
    });
}

function updateBallPreview(type) {
    let previewImage = new Image();
    previewImage.src = `src/ball/${type}.png`;
    previewImage.width = 20;
    previewImage.height = 20;
    $("#ball-preview").html(previewImage)
    document.querySelector('#ball-select').value = type;
    localStorage.setItem("ballType", type);
}

function changeShipColor() {
    const saved_shipSrc = localStorage.getItem("shipColor");
    if (saved_shipSrc) {
        $(".ship-btn").each(function () {
            let imgSrc = $(this).attr("src");
            if (imgSrc === saved_shipSrc) {
                $(this).css({
                    'border-color': 'white',
                    'box-shadow': '0 0 10px rgba(255, 255, 255, 0.5)'
                })
            }
        })
    }

    $(".ship-btn")
        .mouseenter(function () {
            $(this).css({'cursor': 'pointer'})
        })
        .mouseleave(function () {
            $(this).css({'cursor': 'default'})
        })
        .on("click", function () {
            $(".ship-btn").css({
                'border-color': 'none',
                'box-shadow': 'none'
            })
            $(this).css({
                'border-color': 'white',
                'box-shadow': '0 0 10px rgba(255, 255, 255, 0.5)'
            })

            let shipSrc = $(this).attr("src");
            localStorage.setItem("shipColor", shipSrc);

            const shipChangedEvent = new CustomEvent('shipColorChanged', {
                detail: {shipSrc: shipSrc}
            })
            document.dispatchEvent(shipChangedEvent)
        })
}

function openCredit() {
    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        $("#credit")
            .css({left: "20%", display: "block", opacity: "0"})
            .animate({left: "0", opacity: "1"}, 300);
    });
}

function openGame() {
    stopBackgroundAnimation();
    $("#main-menu").animate({left: "-20%", opacity: "0"}, 300, function () {
        $(this).hide();
        showStory("intro", function () {
            $("#game")
                .css({left: "20%", display: "block", opacity: "0"})
                .animate({left: "0", opacity: "1"}, 300, function () {
                    $("#game-wrapper").hide();
                    $("#level_menu").css("display", "block");
                    planetHoverEvent();
                });
        });
    });

    $(".level-btn").on("click", function () {
        let level = $(this).parent().index() + 1;
        startGame_Level(level);
    })
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
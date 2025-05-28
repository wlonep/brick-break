const introStory = [
    {
        text: "은하계 외곽의 평화로운 행성 테라녹스. 수천 년간 평화를 누리던 이곳에 어둠이 드리웠습니다.",
        media: { type: "image", src: "src/story/planet_terrano.png" }
    },
    {
        text: "외계 종족 제노스가 침공을 시작했습니다. 그들의 함대는 하늘을 뒤덮으며 테라녹스를 위협합니다.",
        media: { type: "video", src: "src/story/alien_fleet.mp4", autoplay: true, loop: true }
    },
    {
        text: "당신은 테라녹스의 마지막 우주 비행사입니다. 고대의 우주선을 타고 제노스의 함대를 격퇴해야 합니다.",
        media: { type: "image", src: "src/story/spaceship_launch.gif" }
    },
    {
        text: "각 행성은 제노스의 전초기지로 점령당했습니다. 하나씩 해방시켜 테라녹스의 희망을 되찾아야 합니다.",
        media: { type: "image", src: "src/story/occupied_planet.png" }
    },
    {
        text: "지금, 은하계를 구하기 위한 전투가 시작됩니다. 준비되셨습니까, 사령관?",
        media: { type: "video", src: "src/story/battle_start.mp4", autoplay: true }
    }
];

const endingStory = [
    {
        text: "제노스의 마지막 함대가 파괴되었습니다. 테라녹스는 다시 평화를 되찾았습니다.",
        media: { type: "image", src: "src/story/victory_scene.png" }
    },
    {
        text: "당신의 용맹함 덕분에 은하계는 새로운 희망을 얻었습니다. 당신은 테라녹스의 영웅입니다.",
        media: { type: "video", src: "src/story/hero_ceremony.mp4", autoplay: true }
    },
    {
        text: "하지만 깊은 우주 어딘가, 새로운 위협이 꿈틀대고 있습니다... 계속될 전설을 위해.",
        media: { type: "image", src: "src/story/new_threat.gif" }
    }
];

let currentSlide = 0;
let storyType = "";
let storyInterval = null;

function showStory(type, callback) {
    storyType = type;
    const storyData = type === "intro" ? introStory : endingStory;
    currentSlide = 0;

    // localStorage 체크 (인트로 스토리 한 번만 표시)
    // if (type === "intro" && localStorage.getItem("hasSeenIntroStory") === "true") {
    //     callback();
    //     return;
    // }

    $("#story").css({ left: "100%", display: "block" }).animate({ left: "0%", opacity: "1" }, 300);
    displaySlide(storyData);

    // 스킵 버튼
    $("#story-skip").off("click").on("click", function () {
        clickButton();
        clearInterval(storyInterval);
        $("#story").animate({ left: "100%", opacity: "0" }, 300, function () {
            $(this).hide();
            if (type === "intro") {
                localStorage.setItem("hasSeenIntroStory", "true");
                callback();
            } else {
                goMenu();
            }
        });
    });

    // 자동 슬라이드 전환
    storyInterval = setInterval(() => {
        currentSlide++;
        if (currentSlide >= storyData.length) {
            clearInterval(storyInterval);
            $("#story").animate({ left: "100%", opacity: "0" }, 300, function () {
                $(this).hide();
                if (type === "intro") {
                    localStorage.setItem("hasSeenIntroStory", "true");
                    callback();
                } else {
                    goMenu();
                }
            });
        } else {
            displaySlide(storyData);
        }
    }, 4000); // 4초마다 슬라이드 전환
}

function displaySlide(storyData) {
    const slide = storyData[currentSlide];
    let mediaHtml = "";
    if (slide.media.type === "image") {
        mediaHtml = `<img src="${slide.media.src}" alt="Story image">`;
    } else if (slide.media.type === "video") {
        mediaHtml = `<video ${slide.media.autoplay ? "autoplay" : ""} ${slide.media.loop ? "loop" : ""} muted>
                        <source src="${slide.media.src}" type="video/mp4">
                     </video>`;
    }

    $("#story-content").html(`
        ${mediaHtml}
        <p>${slide.text}</p>
    `);
    // 텍스트에 페이드 인 효과 적용
    $("#story-content p").css("opacity", "0").animate({ opacity: "1" }, 500);
}

window.showStory = showStory;
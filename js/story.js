const introStory = [
    {
        texts: [
            "은하계 외곽의 평화로운 행성 테라녹스.",
            "수천 년간 평화를 누리던 이곳에 어둠이 드리웠습니다."
        ],
        media: { type: "image", src: "src/story/planet_terrano.png" }
    },
    {
        texts: [
            "외계 종족 제노스가 침공을 시작했습니다.",
            "그들의 함대는 하늘을 뒤덮으며 테라녹스를 위협합니다."
        ],
        media: { type: "video", src: "src/story/alien_fleet.mp4", autoplay: true, loop: true }
    },
    {
        texts: [
            "당신은 테라녹스의 마지막 우주 비행사입니다.",
            "우주선을 타고 제노스의 함대를 격퇴해야 합니다."
        ],
        media: { type: "video", src: "src/story/spaceship_launch.mp4", autoplay: true }
    },
    {
        texts: [
            "각 행성은 제노스의 전초기지로 점령당했습니다.",
            "하나씩 해방시켜 테라녹스의 희망을 되찾아야 합니다."
        ],
        media: { type: "image", src: "src/story/occupied_planet.png" }
    },
    {
        texts: [
            "지금, 은하계를 구하기 위한 전투가 시작됩니다.",
            "준비되셨습니까, 사령관?"
        ],
        media: { type: "video", src: "src/story/battle_start.mp4", autoplay: true }
    }
];

const endingStory = [
    {
        texts: [
            "제노스의 마지막 함대가 파괴되었습니다.",
            "당신의 활약으로 테라녹스는 새로운 희망을 얻었습니다.",
            "당신은 테라녹스의 영웅입니다!"
        ],
        media: { type: "image", src: "src/story/victory_scene.png" }
    },
    {
        texts: [
            "하지만 깊은 우주 어딘가..",
            "새로운 위협이 꿈틀대고 있습니다..",
            "계속될 전설을 위해.."
        ],
        media: { type: "image", src: "src/story/new_threat.gif" }
    }
];

let currentSlide = 0;
let storyType = "";
let storyInterval = null;

function showStory(type, callback) {
    if (type === "intro" && localStorage.getItem("hasSeenIntroStory"))
        return callback();

    storyType = type;
    const storyData = type === "intro" ? introStory : endingStory;
    currentSlide = 0;

    $("#story").css({ left: "100%", display: "block" }).animate({ left: "0%", opacity: "1" }, 300);
    displaySlide(storyData);

    // 스킵 버튼
    $("#story-skip").off("click").on("click", function () {
        clearInterval(storyInterval);
        $("#story").animate({ left: "-100%", opacity: "0" }, 300, function () {
            $(this).hide();
            if (type === "intro") {
                localStorage.setItem("hasSeenIntroStory", "true");
                callback();
            } else {
                callback(); // 엔딩 스토리 스킵 시 점수판 표시로 연결
            }
        });
    });

    // 자동 슬라이드 전환
    const slideDuration = type === "ending" ? 8000 : 5500; // 엔딩은 8초, 인트로는 5.5초
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
                    callback(); // 엔딩 스토리 완료 시 점수판 표시로 연결
                }
            });
        } else {
            displaySlide(storyData);
        }
    }, slideDuration);
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

    // 미디어와 텍스트 표시
    $("#story-content").html(`
        ${mediaHtml}
        <p></p>
    `);

    // 미디어 페이드 인 효과
    $("#story-content img, #story-content video").addClass("fade-in");

    // 텍스트를 순차적으로 출력
    const $textElement = $("#story-content p");
    let textIndex = 0;

    const displayText = () => {
        const fullText = slide.texts[textIndex];
        let currentCharIndex = 0;

        $textElement.css("opacity", "0").html(""); // 초기화
        $textElement.animate({ opacity: 1 }, 400); // 페이드 인

        const typingInterval = setInterval(() => {
            if (currentCharIndex < fullText.length) {
                $textElement.html(fullText.substring(0, currentCharIndex + 1));
                currentCharIndex++;
            } else {
                clearInterval(typingInterval);
                if (textIndex < slide.texts.length - 1) {
                    // 다음 텍스트로 전환
                    setTimeout(() => {
                        $textElement.animate({ opacity: 0 }, 400, () => {
                            textIndex++;
                            displayText();
                        });
                    }, 1000); // 1초 대기 후 페이드 아웃
                }
            }
        }, 50);
    };

    displayText();
}

window.showStory = showStory;
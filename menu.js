let bgm;

window.onload = () => {
    bgm = new Audio("src/bgm/spring_walk.mp3");
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(() => playSound());
    toggleDarkMode(localStorage.getItem("dark-mode") === "true");
    changeBGM(localStorage.getItem("bgm") || "spring_walk");
    updateBallPreview(localStorage.getItem("ballType") || "classic");
    changeVolume("sfx-volume");
    //openInfinite();
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
    const color = localStorage.getItem("dark-mode") === "true" ? "#008C8A" : "#FF7875";
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
    $("#main-menu").animate({ left: "-20%", opacity: "0" }, 300, function () {
        $(this).hide();
        $("#settings")
            .css({ left: "20%", display: "block", opacity: "0" })
            .animate({ left: "0", opacity: "1" }, 300);
    });
}

function clickButton() {
    const sfx = new Audio("src/sfx/button.mp3");
    sfx.volume = localStorage.getItem("sfx-volume") / 100;
    sfx.play().then();
}

function toggleDarkMode(checked) {
    localStorage.setItem("dark-mode", checked);
    if (checked) {
        $("body").addClass("dark-mode");
        $("#darkmode").prop("checked", true);
    } else {
        $("body").removeClass("dark-mode");
        $("#darkmode").prop("checked", false);
    }
    changeVolume("volume");
}

function goMenu() {
    $("section").not("#main-menu").animate({ left: "30%", opacity: "0" }, 300, function () {
        $(this).hide();
    });
    $("#main-menu")
        .css({ left: "-30%", display: "block", opacity: "0" })
        .animate({ left: "0%", opacity: "1" }, 300);
}

function updateBallPreview(type) {
    const preview = document.getElementById("ball-preview");
    preview.className = "ball-preview " + type;
    document.querySelector('#ball-select').value = type;
    localStorage.setItem("ballType", type);
}

function openCredit() {
    $("#main-menu").animate({ left: "-20%", opacity: "0" }, 300, function () {
        $(this).hide();
        $("#credit")
            .css({ left: "20%", display: "block", opacity: "0" })
            .animate({ left: "0", opacity: "1" }, 300);
    });
}

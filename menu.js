let bgm;

window.onload = () => {
    bgm = new Audio("src/bgm/spring_walk.mp3");
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(() => playSound());
    toggleDarkMode(localStorage.getItem("dark-mode") === "true");
    changeBGM(localStorage.getItem("bgm") || "spring_walk");
    updateBallPreview(localStorage.getItem("ballType") || "classic");
};

function playSound() {
    if (!bgm) return;
    bgm.play();
    bgm.loop = true;
    changeVolume();
}

function changeVolume(volume) {
    if (!volume) volume = localStorage.getItem("volume") || 30;
    localStorage.setItem("volume", volume);
    const target = document.querySelector("#volume");
    const color = localStorage.getItem("dark-mode") === "true" ? "#008C8A" : "#FF7875";
    target.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${volume}%, #ddd ${volume}%, #ddd 100%)`;
    bgm.volume = volume / 100;
    target.value = volume;
}

function changeBGM(music) {
    clickButton();
    bgm.pause();
    bgm = new Audio(`src/bgm/${music}.mp3`);
    playSound();
    document.querySelector("#sound").value = music;
    localStorage.setItem("bgm", music);
}

function openSettings() {
    clickButton();
    const settings = document.getElementById("settings");
    const menu = document.getElementById("main-menu");

    settings.style.display = "block";
    menu.style.display = "none";
}

function clickButton() {
    const sfx = new Audio("src/sfx/button.mp3");
    sfx.volume = 0.25;
    sfx.play();
}

function toggleDarkMode(checked) {
    clickButton();
    localStorage.setItem("dark-mode", checked);
    if (checked) {
        document.body.classList.add("dark-mode");
        document.querySelector('#darkmode').checked = true;
    }
    else {
        document.body.classList.remove("dark-mode");
        document.querySelector('#darkmode').checked = false;
    }
    changeVolume();
}

function goMenu() {
    clickButton();
    const sections = document.getElementsByTagName("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = "none";
    }
    const menu = document.getElementById("main-menu");
    menu.style.display = "block";
}

function updateBallPreview(type) {
    const preview = document.getElementById("ball-preview");
    preview.className = "ball-preview " + type;
    document.querySelector('#ball-select').value = type;
    localStorage.setItem("ballType", type);
}

function openCredit() {
    clickButton();
    const credit = document.getElementById("credit");
    const menu = document.getElementById("main-menu");

    credit.style.display = "block";
    menu.style.display = "none";
}
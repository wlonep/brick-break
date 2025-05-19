/*
function openInfinite() {
    const settings = document.getElementById("game-infinite");
    const menu = document.getElementById("main-menu");

    settings.style.display = "block";
    menu.style.display = "none";
}
asdfafsd
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const paddle = {
    width: 40,
    height: 5,
    x: (canvas.width - 40) / 2,
    y: canvas.height - 10,
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width)
        paddle.x = canvas.width - paddle.width;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    requestAnimationFrame(draw);
}

draw();*/

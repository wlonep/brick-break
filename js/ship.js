const shipImg = new Image();
shipImg.src = localStorage.getItem("shipColor") || 'src/ship/ship_green.png';

document.addEventListener('shipColorChanged', function (event) {
    shipImg.src = event.detail.shipSrc;
})

function drawShip() {
    if (shipImg.complete) {
        if (!isPlaying) {
            bar.x = (canvas.width - bar.width) / 2; // 초기 위치 가운데로
        }
        const shipDrawX = bar.x + (bar.width - shipWidth) / 2;
        ctx.drawImage(shipImg, shipDrawX, shipY, shipWidth, shipHeight);
    }
}

function drawShipBar() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
}
function drawShip() {
    if (shipImg.complete) {
        const shipDrawX = bar.x + (bar.width - shipWidth) / 2;
        ctx.drawImage(shipImg, shipDrawX, shipY, shipWidth, shipHeight);
    }
}

function drawShipBar() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
}
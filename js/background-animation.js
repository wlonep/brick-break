let backgroundAsteroids = [];
let animationFrameId = null;

function initAsteroids() {
    const container = document.getElementById("asteroid-container");
    for (let i = 0; i < 10; i++) {
        const img = document.createElement("img");
        img.src = `src/menu/back_asteroid-${(i % 2) + 1}.png`;
        img.className = "asteroid";
        img.id = `asteroid-${i}`;
        container.appendChild(img);

        backgroundAsteroids.push({
            id: `asteroid-${i}`,
            scale: Math.random() * 0.8 + 0.2,
            speed: Math.random() * -(0.003) - 0.003,
            angle: Math.random() * 2 * Math.PI
        });
    }
}

function animateBackground() {
    const centerX = window.innerWidth;
    const centerY = window.innerHeight;

    const radius = window.innerWidth;

    backgroundAsteroids.forEach((asteroid) => {
        asteroid.angle += asteroid.speed;
        const radiusX = radius * asteroid.scale;
        const radiusY = radius * asteroid.scale;
        const x = centerX + radiusX * Math.cos(asteroid.angle);
        const y = centerY + radiusY * Math.sin(asteroid.angle);

        const img = document.getElementById(asteroid.id);
        if (img) {
            img.style.left = `${x - 50}px`;
            img.style.top = `${y - 50}px`;
        }
    });

    animationFrameId = requestAnimationFrame(animateBackground);
}

function startBackgroundAnimation() {
    if (!animationFrameId) {
        initAsteroids();
        animateBackground();
    }
}

function stopBackgroundAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        backgroundAsteroids = [];
        const container = document.getElementById("asteroid-container");
        if (container) {
            container.innerHTML = "";
        }
    }
}

window.addEventListener("load", startBackgroundAnimation);
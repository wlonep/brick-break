let backgroundAsteroids = [];
let animationFrameId = null;

function initAsteroids() {
    const container = document.getElementById("asteroid-container");

    // 소행성 8개 생성
    for (let i = 0; i < 8; i++) {
        const img = document.createElement("img");
        img.src = `src/menu/back_asteroid-${(i % 2) + 1}.png`;
        img.className = "asteroid";
        img.id = `asteroid-${i}`;
        container.appendChild(img);

        backgroundAsteroids.push({
            id: `asteroid-${i}`,
            type: "asteroid", // type 속성 추가
            width: 100, // 고정 크기 추가
            height: 100,
            scale: Math.random() * 0.8 + 0.2, // 0.2 ~ 1.0
            speed: Math.random() * -(0.003) - 0.003, // -0.003 ~ -0.006, 반시계 방향
            angle: Math.random() * 2 * Math.PI
        });
    }

    // space-ring-planet 하나 생성
    const ringPlanetImg = document.createElement("img");
    ringPlanetImg.src = "src/menu/space-ring-planet.png";
    ringPlanetImg.className = "asteroid";
    ringPlanetImg.id = "ring-planet";
    container.appendChild(ringPlanetImg);

    backgroundAsteroids.push({
        id: "ring-planet",
        type: "ring-planet",
        width: 200,
        height: 200,
        scale: 0.5,
        speed: -0.0005,
        angle: Math.random() * 2 * Math.PI
    });
}

function animateBackground() {
    const centerX = window.innerWidth;
    const centerY = window.innerHeight;
    const radius = window.innerWidth;

    backgroundAsteroids.forEach((obj) => {
        obj.angle += obj.speed;
        const radiusX = radius * obj.scale;
        const radiusY = radius * obj.scale;
        const x = centerX + radiusX * Math.cos(obj.angle);
        const y = centerY + radiusY * Math.sin(obj.angle);

        const img = document.getElementById(obj.id);
        if (img) {
            // width, height가 정의되지 않은 경우 기본값 사용
            const width = obj.width || 100; // 기본값 100px
            const height = obj.height || 100;
            img.style.width = `${width}px`;
            img.style.height = `${height}px`;
            img.style.left = `${x - width / 2}px`;
            img.style.top = `${y - height / 2}px`;
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
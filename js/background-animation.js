let backgroundAsteroids = [];
let animationFrameId = null;

function initAsteroids() {
    const container = document.getElementById("asteroid-container");

    // 소행성 8개 생성
    for (let i = 0; i < 8; i++) {
        const img = document.createElement("img");
        img.src = `src/menu/back_asteroid-${i + 1}.png`;
        img.className = "asteroid";
        img.id = `asteroid-${i}`;
        container.appendChild(img);

        // 자전 속도와 방향 설정
        const rotationSpeed = Math.random() * 3 + 2; // 2~5초 사이의 랜덤 속도
        const rotationDirection = Math.random() < 0.5 ? "normal" : "reverse"; // 시계 또는 반시계 방향

        img.style.animationDuration = `${rotationSpeed}s`;
        img.style.animationDirection = rotationDirection;

        // 공전 방향 설정 (시계 또는 반시계)
        const orbitDirection = Math.random() < 0.5 ? 1 : -1; // 1: 시계 방향, -1: 반시계 방향

        backgroundAsteroids.push({
            id: `asteroid-${i}`,
            type: "asteroid", // type 속성 추가
            width: 100, // 고정 크기 추가
            height: 100,
            scale: Math.random() * 0.8 + 0.2, // 0.2 ~ 1.0
            speed: (Math.random() * 0.003 + 0.0003) * orbitDirection, // 속도에 방향 적용
            angle: Math.random() * 2 * Math.PI,
            radiusScaleX: Math.random() * 0.5 + 0.5, // 타원형 궤적을 위한 가로 반지름 비율 (0.5~1.0)
            radiusScaleY: Math.random() * 0.5 + 0.5, // 타원형 궤적을 위한 세로 반지름 비율 (0.5~1.0)
        });
    }

    // space-ring-planet 하나 생성
    const ringPlanetImg = document.createElement("img");
    ringPlanetImg.src = "src/menu/space-ring-planet.png";
    ringPlanetImg.className = "asteroid";
    ringPlanetImg.id = "ring-planet";
    container.appendChild(ringPlanetImg);

    // 링 행성의 자전 속도와 방향 설정
    const ringRotationSpeed = Math.random() * 3 + 2;
    const ringRotationDirection = Math.random() < 0.5 ? "normal" : "reverse";

    ringPlanetImg.style.animationDuration = `${ringRotationSpeed}s`;
    ringPlanetImg.style.animationDirection = ringRotationDirection;

    // 링 행성의 공전 방향 설정
    const ringOrbitDirection = Math.random() < 0.5 ? 1 : -1;

    backgroundAsteroids.push({
        id: "ring-planet",
        type: "ring-planet",
        width: 200,
        height: 200,
        scale: 0.5,
        speed: 0.0005 * ringOrbitDirection,
        angle: Math.random() * 2 * Math.PI,
        radiusScaleX: Math.random() * 0.5 + 0.5,
        radiusScaleY: Math.random() * 0.5 + 0.5,
    });
}

function animateBackground() {
    const centerX = window.innerWidth;
    const centerY = window.innerHeight;
    const radius = window.innerWidth;

    backgroundAsteroids.forEach((obj) => {
        obj.angle += obj.speed;
        // 타원형 궤적을 위한 가로/세로 반지름 설정
        const radiusX = radius * obj.scale * obj.radiusScaleX;
        const radiusY = radius * obj.scale * obj.radiusScaleY;
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
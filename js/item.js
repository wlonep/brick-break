const itemTypes = ['ammo', 'energy', 'health', 'rocket'];
//ammo: 공 한개 더 발사 가능 / energy: 10초간 공 속도 증가 (1.4배)/ health: 목숨 +1 / rocket: 화면 내 있는 운석 모두 파괴
const itemWidth = 30;
const itemHeight = 30;
const itemSpeed = 100;
const itemDropChance = 1;

const itemImages = {};
itemTypes.forEach(type => {
    itemImages[type] = new Image();
    itemImages[type].src = `src/icons/${type}.png`; // 수정
});

let items = [];

function createItem(x, y) {
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    console.log(`아이템 드랍 : ${randomType}`); // 디버깅 로그 추가

    items.push({
        x: x,
        y: y,
        width: itemWidth,
        height: itemHeight,
        type: randomType,
        img: itemImages[randomType],
    });
}


function updateItems(delta){
    for(let i = items.length-1; i>=0; i--){
        const item = items[i];
        item.y+=itemSpeed*delta;

        //바닥에 아이템 충돌
        if(item.y > canvas.height){
            items.splice(i, 1);
            continue;
        }

        //플레이어 바와 아이템 충돌
        if(itemHitsBar(item)){
            applyItemEffect(item); //아이템을 먹었을때 동작하는 함수
            const itemSfx = new Audio("src/sfx/pling.mp3");
            itemSfx.volume = localStorage.getItem("sfx-volume") / 100
            itemSfx.play();

            items.splice(i, 1);
        }
    }
}

function itemHitsBar(item){
    return (
        (item.x < bar.x+bar.width && item.x + item.width > bar.x) &&
        (item.y < bar.y + bar.height && item.y + item.height > bar.y)
    )
}
function applyItemEffect(item) {
    showItemEffect(item.type);
    const health = $("#health");

    switch (item.type) {
        case 'ammo':
            maxBalls = Math.min(maxBalls + 1, 4); // 공 최대 4개까지 가능
            break;
        case 'energy':
            if (speedMultiplier === 1) {
                speedMultiplier = 1.2; // 최대 속도는 기본 속도의 1.2배
                setTimeout(() => {
                    speedMultiplier = 1;
                }, 10000);
            }
            break;
        case 'health':
            if (lives < 5) {
                lives++;
                health.empty().append("목숨: ");
                for (let i = 0; i < lives; i++) {
                    const heart = new Image();
                    heart.src = "src/icons/heart.png";
                    health.append(heart);
                }
            }
            break;
        case 'rocket':
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const asteroid = asteroids[i];
                addScore(50);
                if (Math.random() < itemDropChance) {
                    createItem(
                        asteroid.x + asteroid.width / 2 - itemWidth / 2,
                        asteroid.y + asteroid.height / 2 - itemHeight / 2
                    );
                }
                asteroids.splice(i, 1); // 운석 제거
            }
            break;
    }
}

function showItemEffect(itemType){
    let message = "";
    let className = "";

    switch(itemType){
        case 'ammo':
            message = `탄알 획득!<br/>공 개수+1(최대4)<br/>(현재 개수: ${maxBalls}개)`;
            className = "ammo-effect";
            break;

        case 'energy':
            message = "에너지 획득!<br/>공 속도 증가 (10초)";
            className = "energy-effect";
            break;

        case 'health':
            message = "라이프 획득!<br/>목숨 +1 (최대 5)";
            className = "health-effect";
            break;

        case 'rocket':
            message = "로켓 획득!<br/>모든 운석 파괴";
            className = "rocket-effect";
            break;
    }
    $(`#item-status .item-effect`).remove();

    $(`
        <div class="item-effect ${className}">
            <img src="src/icons/${itemType}.png" alt="${itemType}" width="24" height="24"/>
            <span>${message}</span>
        </div>
    `).appendTo("#item-status");
}

function drawItems() {
    for (const item of items) {
        if (!item.img || !item.img.complete) continue;

        ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
    }
}
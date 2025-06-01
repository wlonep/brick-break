function changeShipColor() {
    const saved_shipSrc = localStorage.getItem("shipColor") || "blue";

    const shipBtn = $(".ship-btn")
    if (saved_shipSrc) {
        shipBtn.each(function () {
            let imgSrc = $(this).attr("src");
            if (imgSrc.includes(saved_shipSrc)) {
                $(this).css({
                    //'border-color': 'white',
                    'border': '1px solid white',
                    'border-radius': '5px',
                    'box-shadow': '0 0 10px rgba(255, 255, 255, 0.5)'
                })
            }
        })
    }
    shipBtn
        .mouseenter(function () {
            $(this).css({'cursor': 'pointer'})
        })
        .mouseleave(function () {
            $(this).css({'cursor': 'default'})
        })
        .on("click", function () {
            clickButton();
            shipBtn.css({
                'border': '1px solid transparent',
                'box-shadow': '0 0 10px rgba(0, 0, 0, 0)'
            })
            $(this).css({
                'border': '1px solid white',
                'border-radius': '5px',
                'box-shadow': '0 0 10px rgba(255, 255, 255, 0.5)'
            })

            let shipSrc = $(this).attr("src");
            localStorage.setItem("shipColor", shipSrc);

            const shipChangedEvent = new CustomEvent('shipColorChanged', {
                detail: {shipSrc: shipSrc}
            })
            document.dispatchEvent(shipChangedEvent)
        })
}

function changeVolume(type, volume) {
    if (!volume) volume = localStorage.getItem(type) || 30;
    localStorage.setItem(type, volume);
    $(`#${type}`).css({"background": `linear-gradient(to right, #FF7875 0%, #FF7875 ${volume}%, #ddd ${volume}%, #ddd 100%)`}).val(volume);
    if (type === "volume") {
        bgm.volume = volume / 100;
    }
}

function changeBGM(music) {
    bgm.pause();
    bgm = new Audio(`src/bgm/${music}.mp3`);
    playSound();
    $("#sound").val(music);
    localStorage.setItem("bgm", music);
}

function changeBall(type) {
    let previewImage = new Image();
    previewImage.src = `src/ball/${type}.png`;
    previewImage.width = 20;
    previewImage.height = 20;
    $("#ball-preview").html(previewImage)
    $('#ball-select').val(type);
    localStorage.setItem("ballType", type);
    const ballChangedEvent = new CustomEvent('ballTypeChanged', {
        detail: {ballType: type}
    });
    document.dispatchEvent(ballChangedEvent);
}

function openPopupSettings() {
    const container = $(`
            <div class="settings-content">
                <label for="sound">배경 음악:</label>
                <div class="select-wrapper">
                    <select id="sound" onchange="changeBGM(this.value)">
                        <option value="spaceship">기본</option>
                        <option value="a_night_full_of_stars">평화로운</option>
                        <option value="intro" selected>신나는</option>
                        <option value="pixel_dreams">잔잔한</option>
                        <option value="the_80s_nights">레트로</option>
                    </select>
                </div>
            </div>
            <div class="settings-content">
                <label for="volume">BGM 음량:</label>
                <input type="range" id="volume" min="0" max="100" value="30"
                       onchange="changeVolume('volume', this.value)"
                       oninput="changeVolume('volume', this.value)">
            </div>
            <div class="settings-content">
                <label for="sfx-volume">효과음 음량:</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="30"
                       onchange="changeVolume('sfx-volume', this.value)"
                       oninput="changeVolume('sfx-volume', this.value)">
            </div><br/>`);
    const backBtn = $(`
            <div class="settings-content">
                <div class="menu-btn" onclick="pauseGame()"><i class="fa-solid fa-chevron-left"></i> 뒤로가기</div>
            </div>`);
    $("#status").html('<header><h2>환경설정</h2></header>').append(container, backBtn);
    $("#sound").val(localStorage.getItem("bgm"));
    changeVolume('volume');
    changeVolume('sfx-volume');
}
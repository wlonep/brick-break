const style = "color: deepskyblue; font-weight: bold; font-family: DungGeunMo;"

console.log("%cSPACE\nPIONEER", `${style} font-size: 100px;`)
console.log("%c치트 코드를 입력하세요.", `${style} font-size: 25px`)

Object.defineProperty(window, 'helpmeimstuck', {
    get() {
        console.log("%c치트 코드가 활성화되었습니다.", `${style} font-size: 25px`);
        isCheat = true;
    }
});

Object.defineProperty(window, 'greenjoa', {
    get() {
        console.log("%c치트 코드가 비활성화되었습니다.", `${style} font-size: 25px`);
        isCheat = false;
    }
});
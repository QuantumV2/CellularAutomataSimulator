const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

let level = 5; // Initial level of the fractal
let zoomFactor = 1.5; // Zoom factor for each scroll

function drawSierpinskiCarpet(level, x, y, size) {
    ctx.fillStyle = "black";
    if (level === 0) {
        ctx.fillRect(x, y, size, size);
    } else {
        const newSize = size / 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!(i === 1 && j === 1)) {
                    drawSierpinskiCarpet(level - 1, x + i * newSize, y + j * newSize, newSize);
                }
            }
        }
    }
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    clearCanvas();
    const initialSize = Math.min(canvas.width, canvas.height);
    drawSierpinskiCarpet(level, 0, 0, initialSize);
}

draw();

function download() {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "sierpinskicarpet.png";
    link.click();
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2 ;
    draw();
});

window.onkeyup = function (e) { 
    const delta = e.keyCode;
    if (delta === 187 && level < 10) {
        level++;
    } else if (delta === 189) {
        if (level > 0) {
            level--;
        }
    }
    draw();
};

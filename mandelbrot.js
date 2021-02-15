function inSet(cr, ci) {
    let zr = 0;
    let zi = 0;
    let i = 0;
    while (Math.sqrt((zr * zr) + (zi * zi)) < 2) {
        if (i > MAX_ITERATIONS) {
            return i;
        }
        let zrn = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = zrn;
        i++;
    }
    return i;
}

let screenWidth = window.innerWidth * 2;
let screenHeight = window.innerHeight * 2;
const WORLD_VIEW_TOP_LEFT = [-2, 2];
const WORLD_VIEW_BOTTOM_RIGHT = [2, -2];
const MAX_ITERATIONS = 500;
const LN_MAX_ITERATIONS = Math.log(MAX_ITERATIONS);

function screenToWorld(x) {
    const topLeft = worldView[0];
    const bottomRight = worldView[1];
    return [
        x[0] * 2 * (
            (bottomRight[0] - topLeft[0]) /
            screenWidth
        ) + topLeft[0],
        (x[1] * 2 * (
            (bottomRight[1] - topLeft[1]) /
            screenHeight
        ) + topLeft[1])
    ];
}

function drawMandelbrot(ctx, imageData) {
    let start = new Date().getTime();
    const topLeft = worldView[0];
    const bottomRight = worldView[1];
    
    const data = imageData.data;
    for (let i = 0; i < screenWidth; i++) {
        for (let j = 0; j < screenHeight; j++) {
            const cr = i * (
                (bottomRight[0] - topLeft[0]) /
                screenWidth) + topLeft[0];
            const ci = (j * ((bottomRight[1] - topLeft[1]) /
                screenHeight) + topLeft[1]);
            
            const value = inSet(cr, ci);
            const index = (i + j * screenWidth) * 4;
            // let v = 255 * (1 - (Math.log(value) / LN_MAX_ITERATIONS));
            // let v = value > MAX_ITERATIONS ? 0: 255;
            let v = 255 * (1 - value / MAX_ITERATIONS);
            data[index] = v;
            data[index + 1] = v;
            data[index + 2] = v;
            data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    let end = new Date().getTime();
    console.log("draw took", (end - start) + "ms");
}

let worldView = [WORLD_VIEW_TOP_LEFT, WORLD_VIEW_BOTTOM_RIGHT];

async function main() {
    const canvas = document.createElement("canvas");
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.backgroundColor = "rgba(0, 0, 255, 0.5)";

    let mouseDown = false;
    let pendingTopLeft;
    canvas.addEventListener("mousedown", (event) => {
        mouseDown = true;
        const mouseCoords = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
        pendingTopLeft = mouseCoords;
        overlay.style.display = "block";
    });
    canvas.addEventListener("mousemove", (event) => {
        if (mouseDown) {
            const mouseCoords = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
    
            overlay.style.left = (canvas.offsetLeft + pendingTopLeft[0]) + "px";
            overlay.style.top = (canvas.offsetTop + pendingTopLeft[1]) + "px";
            overlay.style.width = (mouseCoords[0] - pendingTopLeft[0]) + "px";
            overlay.style.height = (mouseCoords[1] - pendingTopLeft[1]) + "px";
        }
    })
    canvas.addEventListener("mouseup", async (event) => {
        mouseDown = false;
        const mouseCoords = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
        const worldCoord = screenToWorld(mouseCoords);
        overlay.style.display = "none";
        worldView = [screenToWorld(pendingTopLeft), worldCoord];
        context.fillStyle = "white";
        context.fillRect(0, 0, screenWidth, screenHeight);
        drawMandelbrot(context, imageData);
    });
    canvas.width = screenWidth;
    canvas.height = screenWidth;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    let transform = `scale(0.5) translate(${-(screenWidth / 2)}px, ${-(screenHeight / 2)}px)`;
    canvas.style.transform = transform;
    document.body.style.overflow = "hidden";
    
    // console.log("transform", transform);
    document.body.appendChild(overlay);
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(screenWidth, screenHeight);

    drawMandelbrot(context, imageData);

}

main();

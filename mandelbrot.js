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

let screenWidth = 0;
let screenHeight = 0;
const WORLD_VIEW_TOP_LEFT = [-2, 2];
const WORLD_VIEW_BOTTOM_RIGHT = [2, -2];
const MAX_ITERATIONS = 100;
const LN_MAX_ITERATIONS = Math.log(MAX_ITERATIONS);
const canvasScaleFactor = 1;
let worldViewOriginX = 0;
let worldViewOriginY = 0;
let worldViewScaleFactor;

function screenToWorld2(x) {
    const topLeft = worldView[0];
    const bottomRight = worldView[1];
    return [
        x[0] * canvasScaleFactor * (
            (bottomRight[0] - topLeft[0]) /
            screenWidth
        ) + topLeft[0],
        (x[1] * canvasScaleFactor * (
            (bottomRight[1] - topLeft[1]) /
            screenHeight
        ) + topLeft[1])
    ];
}

function drawMandelbrot(ctx, imageData) {
    // let start = new Date().getTime();
    let top = worldViewOriginY - (screenHeight * worldViewScaleFactor) / 2;
    let left = worldViewOriginX - (screenWidth * worldViewScaleFactor) / 2;
    // console.log("top", top, "left", left);
    const data = imageData.data;
    for (let i = 0; i < screenWidth; i++) {
        for (let j = 0; j < screenHeight; j++) {
            const cr = i * worldViewScaleFactor + left;
            const ci = j * worldViewScaleFactor + top;
            
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
    // let end = new Date().getTime();
    // console.log("draw took", (end - start) + "ms");
}

async function main() {
    const canvas = document.createElement("canvas");

    let draggingFrom = null;
    canvas.addEventListener("mousedown", (event) => {
        draggingFrom = [event.offsetX, event.offsetY]
    });
    canvas.addEventListener("mousemove", (event) => {
        if (draggingFrom) {
            worldViewOriginX += (draggingFrom[0] - event.offsetX) * worldViewScaleFactor;
            worldViewOriginY += (draggingFrom[1] - event.offsetY) * worldViewScaleFactor;
            requestAnimationFrame(render);
            draggingFrom = [event.offsetX, event.offsetY];
        }
    });
    canvas.addEventListener("mouseup", async (event) => {
        draggingFrom = null;
    });
    window.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = 1 - (-e.deltaY * 0.002);
        
        const pointerX = e.offsetX;
        const pointerY = e.offsetY;
        const zoomOld = worldViewScaleFactor;
        const zoomNew = delta * worldViewScaleFactor;
        
        const newOriginX = worldViewOriginX
            - (screenWidth * zoomOld) / 2 + pointerX * zoomOld
            + (screenWidth * zoomNew) / 2 - pointerX * zoomNew;
        
        const newOriginY = worldViewOriginY
            - (screenHeight * zoomOld) / 2 + pointerY * zoomOld
            + (screenHeight * zoomNew) / 2 - pointerY * zoomNew;
        
        worldViewScaleFactor = zoomNew;
        worldViewOriginX = newOriginX;
        worldViewOriginY = newOriginY;
        // console.log("newOriginX", newOriginX, "newOriginY", newOriginY);
        
        requestAnimationFrame(render);
    }, { passive: false });
    canvas.width = window.innerWidth * canvasScaleFactor;
    canvas.height = window.innerHeight * canvasScaleFactor;
    screenWidth = canvas.width;
    screenHeight = canvas.height;
    let xScaleFactor = 4 / screenWidth;
    let yScaleFactor = 4 / screenHeight;
    worldViewScaleFactor = Math.max(xScaleFactor, yScaleFactor);
    console.log("screenWidth", screenWidth);
    console.log("screenHeight", screenHeight);
    console.log("xScaleFactor", xScaleFactor, "yScaleFactor", yScaleFactor);
    console.log("worldViewScaleFactor", worldViewScaleFactor);
    
    let widthOffset = (screenWidth - (screenWidth * canvasScaleFactor)) / 2;
    let heightOffset = (screenHeight - (screenHeight * canvasScaleFactor)) / 2;
    let transform = `scale(${1 / canvasScaleFactor}) translate(${widthOffset}px, ${heightOffset}px)`;
    canvas.style.transform = transform;
    document.body.style.overflow = "hidden";
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(screenWidth, screenHeight);

    requestAnimationFrame(render);
    
    const debouncedRender = throttle(200, render);
    function render() {
        drawMandelbrot(context, imageData)
    }

}

main();
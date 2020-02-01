import { sleep } from "simple-sleep";

type ComplexNumber = [number, number];

function add(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
    return [x[0] + y[0], x[1] + y[1]];
}

function multiply(x: ComplexNumber, y: ComplexNumber): ComplexNumber {
    const product1 = x[0] * y[0];
    const product2 = x[0] * y[1];
    const product3 = x[1] * y[0];
    const product4 = x[1] * y[1];
    const answer: ComplexNumber = [product1 - product4, product2 + product3];
    return answer;
}

function square(x: ComplexNumber): ComplexNumber {
    return multiply(x, x);
}

function distance(x: ComplexNumber): number {
    return Math.sqrt((x[0] * x[0]) + (x[1] * x[1]));
}

function inSet(c: ComplexNumber): boolean {
    let x: ComplexNumber = [0, 0];
    let i = 0;
    while (distance(x) < 2) {
        if (i > 1000) {
            return true;
        }
        // z^2 + c
        x = add(square(x), c);
        i++;
    }
    return false;
}

const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 600;
const WORLD_VIEW_TOP_LEFT: ComplexNumber = [-2, 2];
const WORLD_VIEW_BOTTOM_RIGHT: ComplexNumber = [2, -2];

function screenToWorld(x: ComplexNumber): ComplexNumber {
    const topLeft = worldView[0];
    const bottomRight = worldView[1];
    return [
        x[0] * (
            (bottomRight[0] - topLeft[0]) /
            SCREEN_WIDTH
        ) + topLeft[0],
        (x[1] * (
            (bottomRight[1] - topLeft[1]) /
            SCREEN_HEIGHT
        ) + topLeft[1])
    ];
}

function drawMandelbrot(context: CanvasRenderingContext2D) {
    for (let i = 0; i < SCREEN_WIDTH; i++) {
        for (let j = 0; j < SCREEN_HEIGHT; j++) {
            const c = screenToWorld([i, j]);
            // console.log("c", c);
            if (inSet(c)) {
                context.fillStyle = "black";
                context.fillRect(i, j, 1, 1);
            } else {
                context.fillStyle = "lightyellow";
                context.fillRect(i, j, 1, 1);
            }
        }
    }
}

let worldView = [WORLD_VIEW_TOP_LEFT, WORLD_VIEW_BOTTOM_RIGHT];

async function main(): Promise<void> {
    const canvas = document.createElement("canvas");
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.backgroundColor = "rgba(0, 0, 255, 0.5)";

    let mouseDown: boolean = false;
    let pendingTopLeft: ComplexNumber;
    canvas.addEventListener("mousedown", (event: MouseEvent) => {
        mouseDown = true;
        const mouseCoords: ComplexNumber = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
        pendingTopLeft = mouseCoords;
        overlay.style.display = "block";
    });
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
        if (mouseDown) {
            const mouseCoords: ComplexNumber = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];

            overlay.style.left = (canvas.offsetLeft + pendingTopLeft[0]) + "px";
            overlay.style.top = (canvas.offsetTop + pendingTopLeft[1]) + "px";
            overlay.style.width = (mouseCoords[0] - pendingTopLeft[0]) + "px";
            overlay.style.height = (mouseCoords[1] - pendingTopLeft[1]) + "px";
        }
    })
    canvas.addEventListener("mouseup", async (event: MouseEvent) => {
        mouseDown = false;
        const mouseCoords: ComplexNumber = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
        const worldCoord: ComplexNumber = screenToWorld(mouseCoords);
        overlay.style.display = "none";
        worldView = [screenToWorld(pendingTopLeft), worldCoord];
        context.fillStyle = "white";
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        await sleep(0);
        drawMandelbrot(context);
    });
    canvas.style.border = "1px solid black";
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    document.body.appendChild(overlay);
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");

    drawMandelbrot(context);

}

main();

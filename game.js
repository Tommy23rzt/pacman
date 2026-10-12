const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animations");
const ghostFrames = document.getElementById("ghosts");

let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;
let lives = 3;
let ghostCount = 4;
let gameOver = false;
let gameWon = false;
let paused = false;
let foodLeft = 0;
let initialFoodCount = 0;
let frightenedDuration = 7000;
let frightenedUntil = 0;
let frightenedScore = 200;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

// Game variables
let fps = 30;
let pacman;
let oneBlockSize = 20;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "black";


// we now create the map of the walls,
// if 1 wall, if 0 not wall
// 21 columns // 23 rows
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

// for (let i = 0; i < map.length; i++) {
//     for (let j = 0; j < map[0].length; j++) {
//         map[i][j] = 2;
//     }
// }

let countFood = () => {
    let count = 0;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2 || map[i][j] == 4) {
                count++;
            }
        }
    }
    return count;
};

let isFrightened = () => Date.now() < frightenedUntil;

let scatterChasePattern = [
    7000, 20000, 7000, 20000, 5000, 20000, 5000,
];
let inScatterPhase = () => {
    let phaseStart = 0;
    for (let i = 0; i < scatterChasePattern.length; i++) {
        if (Date.now() < phaseStart + scatterChasePattern[i]) {
            return i % 2 === 0;
        }
        phaseStart += scatterChasePattern[i];
    }
    return false;
};

let powerPelletCount = 4;
let powerPelletMinGap = 3;

let placePowerPellets = () => {
    let candidates = [];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            let pacmanStart = i == 1 && j == 1;
            let ghostHouse = i >= 10 && i <= 11 && j >= 9 && j <= 10;
            if (map[i][j] == 2 && !pacmanStart && !ghostHouse) {
                candidates.push({ i: i, j: j });
            }
        }
    }
    let placed = [];
    for (let n = 0; n < powerPelletCount && candidates.length > 0; n++) {
        let available = candidates.filter((cell) =>
            placed.every(
                (p) =>
                    Math.max(Math.abs(p.i - cell.i), Math.abs(p.j - cell.j)) >=
                    powerPelletMinGap
            )
        );
        if (available.length == 0) {
            break;
        }
        candidates = available;
        let index = Math.floor(Math.random() * candidates.length);
        let cell = candidates.splice(index, 1)[0];
        map[cell.i][cell.j] = 4;
        placed.push(cell);
    }
};

let initialMap = map.map((row) => row.slice());
placePowerPellets();
foodLeft = countFood();
initialFoodCount = foodLeft;

let createNewPacman = () => {
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

let gameLoop = () => {
    if (paused) {
        draw();
        return;
    }
    if (!gameOver && !gameWon) {
        update();
    } else {
        stopPacmanMusic();
    }
    draw();
};

let gameInterval = setInterval(gameLoop, 1000 / fps);

let restartPacmanAndGhosts = () => {
    clearInterval(pacman.animationInterval);
    for (let i = 0; i < ghosts.length; i++) {
        clearInterval(ghosts[i].directionInterval);
    }
    frightenedUntil = 0;
    createNewPacman();
    createGhosts();
};

let resetGame = () => {
    lives = 3;
    score = 0;
    gameOver = false;
    gameWon = false;
    paused = false;
    map = initialMap.map((row) => row.slice());
    placePowerPellets();
    foodLeft = countFood();
    restartPacmanAndGhosts();
};

let onGhostCollision = () => {
    lives--;
    if (lives <= 0) {
        gameOver = true;
        return;
    }
    restartPacmanAndGhosts();
};

let update = () => {
    pacman.moveProcess();
    pacman.eat();
    if (gameWon) {
        return;
    }
    updateGhosts();
    let collidedGhost = pacman.checkGhostCollision(ghosts);
    if (collidedGhost >= 0) {
        if (isFrightened()) {
            ghosts[collidedGhost].beEaten();
            score += frightenedScore;
        } else {
            onGhostCollision();
        }
    }
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                createRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3,
                    "#FEB897"
                );
            } else if (map[i][j] == 4) {
                canvasContext.fillStyle = "#FEB897";
                canvasContext.beginPath();
                canvasContext.arc(
                    j * oneBlockSize + oneBlockSize / 2,
                    i * oneBlockSize + oneBlockSize / 2,
                    oneBlockSize / 3,
                    0,
                    2 * Math.PI
                );
                canvasContext.fill();
            }
        }
    }
};

let drawRemainingLives = () => {
    canvasContext.font = "16px 'Press Start 2P', 'Emulogic', monospace";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Lives: ", 220, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }
};

let drawScore = () => {
    canvasContext.font = "16px 'Press Start 2P', 'Emulogic', monospace";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    drawRemainingLives();
    if (gameOver) {
        drawOverlay("GAME OVER", "#FF2D55");
    } else if (gameWon) {
        drawOverlay("YOU WIN!", "#36E0A5");
    } else if (paused) {
        drawOverlay("PAUSA", "#FFD93B", "Premi P per riprendere");
    }
};

let drawOverlay = (text, color, subtitle) => {
    createRect(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.78)");
    canvasContext.textAlign = "center";
    canvasContext.textBaseline = "middle";
    canvasContext.font =
        "36px 'Press Start 2P', 'Emulogic', monospace";
    canvasContext.shadowColor = color;
    canvasContext.shadowBlur = 24;
    canvasContext.fillStyle = color;
    canvasContext.fillText(text, canvas.width / 2, canvas.height / 2 - 12);
    canvasContext.shadowBlur = 0;
    canvasContext.font =
        "12px 'Press Start 2P', 'Emulogic', monospace";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        subtitle || "Premi un tasto per ricominciare",
        canvas.width / 2,
        canvas.height / 2 + 26
    );
    canvasContext.textAlign = "start";
    canvasContext.textBaseline = "alphabetic";
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount; i++) {
        let ghostX = (9 + (i % 2)) * oneBlockSize;
        let ghostY = (10 + Math.floor(i / 2)) * oneBlockSize;
        let newGhost = new Ghost(
            ghostX,
            ghostY,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            i
        );
        ghosts.push(newGhost);
    }
};

createNewPacman();
createGhosts();
gameLoop();

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    if (k == 80) {
        // p
        if (gameOver || gameWon) {
            return;
        }
        paused = !paused;
        if (paused) {
            stopPacmanMusic();
        } else {
            startPacmanMusic();
        }
        return;
    }
    if (paused) {
        return;
    }
    startPacmanMusic();
    if (gameOver || gameWon) {
        resetGame();
        return;
    }
    setTimeout(() => {
        if (k == 37 || k == 65) {
            // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
        } else if (k == 38 || k == 87) {
            // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
        } else if (k == 39 || k == 68) {
            // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
        } else if (k == 40 || k == 83) {
            // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
});

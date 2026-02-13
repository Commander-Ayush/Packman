// ==================== BOARD CONFIG ====================
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

// ==================== IMAGES ====================
let blueGhostImage, greenGhostImage, redGhostImage;
let pinkGhostImage, orangeGhostImage, scaredGhostImage;
let pacmanUpImage, pacmanDownImage, pacmanLeftImage, pacmanRightImage;
let wallImage;

// ==================== GAME STATE ====================
let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;
let scaredMode = false;
let scaredTimer = 0;
const SCARED_DURATION = 200; // ~10 seconds at 50ms tick

// ==================== TILE MAP ====================
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

// ==================== SETS ====================
const walls = new Set();
const ghosts = new Set();
const coins = new Set();
const powerPellets = new Set();
let pacman;

// ==================== BLOCK CLASS ====================
class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.xCoordinate = x;
        this.yCoordinate = y;
        this.blockWidth = width;
        this.blockHeight = height;
        this.startX = x;
        this.startY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.direction = null;
        this.color = null; // used for ghost color identity
        this.scared = false;
    }
}

// ==================== ON LOAD ====================
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages(() => {
        loadMap();
        document.addEventListener("keydown", handleKeyDown);
        requestAnimationFrame(gameLoop);
    });
};

// ==================== IMAGE LOADER ====================
function loadImages(callback) {
    let loaded = 0;
    const total = 10;
    function onLoad() { loaded++; if (loaded === total) callback(); }

    wallImage = new Image(); wallImage.onload = onLoad; wallImage.src = "./wall.png";
    blueGhostImage = new Image(); blueGhostImage.onload = onLoad; blueGhostImage.src = "./blueGhost.png";
    redGhostImage = new Image(); redGhostImage.onload = onLoad; redGhostImage.src = "./redGhost.png";
    pinkGhostImage = new Image(); pinkGhostImage.onload = onLoad; pinkGhostImage.src = "./pinkGhost.png";
    orangeGhostImage = new Image(); orangeGhostImage.onload = onLoad; orangeGhostImage.src = "./orangeGhost.png";
    scaredGhostImage = new Image(); scaredGhostImage.onload = onLoad; scaredGhostImage.src = "./scaredGhost.png";
    pacmanDownImage = new Image(); pacmanDownImage.onload = onLoad; pacmanDownImage.src = "./pacmanDown.png";
    pacmanLeftImage = new Image(); pacmanLeftImage.onload = onLoad; pacmanLeftImage.src = "./pacmanLeft.png";
    pacmanUpImage = new Image(); pacmanUpImage.onload = onLoad; pacmanUpImage.src = "./pacmanUp.png";
    pacmanRightImage = new Image(); pacmanRightImage.onload = onLoad; pacmanRightImage.src = "./pacmanRight.png";
}

// ==================== LOAD MAP ====================
function loadMap() {
    walls.clear(); coins.clear(); ghosts.clear(); powerPellets.clear();

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < columnCount; col++) {
            const ch = tileMap[row][col];
            const x = col * tileSize;
            const y = row * tileSize;

            if (ch === 'X') {
                walls.add(new Block(wallImage, x, y, tileSize, tileSize));
            } else if (ch === 'b') {
                const g = new Block(blueGhostImage, x, y, tileSize, tileSize);
                g.color = 'blue'; g.velocityX = tileSize / 4; setRandomDirection(g);
                ghosts.add(g);
            } else if (ch === 'o') {
                const g = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                g.color = 'orange'; setRandomDirection(g);
                ghosts.add(g);
            } else if (ch === 'p') {
                const g = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                g.color = 'pink'; setRandomDirection(g);
                ghosts.add(g);
            } else if (ch === 'r') {
                const g = new Block(redGhostImage, x, y, tileSize, tileSize);
                g.color = 'red'; setRandomDirection(g);
                ghosts.add(g);
            } else if (ch === 'P') {
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
                pacman.velocityX = 0; pacman.velocityY = 0;
                pacman.nextVX = 0; pacman.nextVY = 0;
            } else if (ch === ' ') {
                coins.add(new Block(null, x + 13, y + 13, 6, 6));
            } else if (ch === 'O') {
                // Power pellets at the O corners
                powerPellets.add(new Block(null, x + 10, y + 10, 12, 12));
            }
        }
    }
}

function setRandomDirection(ghost) {
    const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    ghost.velocityX = d[0];
    ghost.velocityY = d[1];
}

// ==================== INPUT ====================
function handleKeyDown(e) {
    if (gameOver || gameWon) {
        if (e.code === "Enter" || e.code === "Space") restartGame();
        return;
    }
    const speed = tileSize / 4; // 8px per frame
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
        pacman.nextVX = -speed; pacman.nextVY = 0;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        pacman.nextVX = speed; pacman.nextVY = 0;
    } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        pacman.nextVX = 0; pacman.nextVY = -speed;
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        pacman.nextVX = 0; pacman.nextVY = speed;
    }
}

// ==================== COLLISION HELPERS ====================
function collides(a, b) {
    return a.xCoordinate < b.xCoordinate + b.blockWidth &&
        a.xCoordinate + a.blockWidth > b.xCoordinate &&
        a.yCoordinate < b.yCoordinate + b.blockHeight &&
        a.yCoordinate + a.blockHeight > b.yCoordinate;
}

function collidesWithWall(block, vx, vy) {
    const future = {
        xCoordinate: block.xCoordinate + vx,
        yCoordinate: block.yCoordinate + vy,
        blockWidth: block.blockWidth,
        blockHeight: block.blockHeight
    };
    for (let wall of walls) {
        if (collides(future, wall)) return true;
    }
    return false;
}

// ==================== GAME LOOP ====================
let lastTime = 0;
let tickAccum = 0;
const TICK_MS = 50;

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    tickAccum += dt;

    while (tickAccum >= TICK_MS) {
        tickAccum -= TICK_MS;
        if (!gameOver && !gameWon) update();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// ==================== UPDATE ====================
function update() {
    movePacman();
    moveGhosts();
    checkCoinCollision();
    checkGhostCollision();
    checkWin();
    if (scaredMode) {
        scaredTimer--;
        if (scaredTimer <= 0) endScaredMode();
    }
}

function movePacman() {
    // Try queued direction first
    if (pacman.nextVX !== undefined &&
        !collidesWithWall(pacman, pacman.nextVX, pacman.nextVY)) {
        pacman.velocityX = pacman.nextVX;
        pacman.velocityY = pacman.nextVY;
        pacman.nextVX = 0;
        pacman.nextVY = 0;
    }

    if (!collidesWithWall(pacman, pacman.velocityX, pacman.velocityY)) {
        pacman.xCoordinate += pacman.velocityX;
        pacman.yCoordinate += pacman.velocityY;
    }

    // Wrap around horizontally
    if (pacman.xCoordinate < -tileSize) pacman.xCoordinate = boardWidth;
    if (pacman.xCoordinate > boardWidth) pacman.xCoordinate = -tileSize;

    // Update image based on direction
    if (pacman.velocityX > 0) pacman.image = pacmanRightImage;
    else if (pacman.velocityX < 0) pacman.image = pacmanLeftImage;
    else if (pacman.velocityY < 0) pacman.image = pacmanUpImage;
    else if (pacman.velocityY > 0) pacman.image = pacmanDownImage;
}

function moveGhosts() {
    const speed = scaredMode ? 1 : 2;
    for (let ghost of ghosts) {
        // Try to move; if blocked, pick new random direction
        if (collidesWithWall(ghost, ghost.velocityX, ghost.velocityY) ||
            (ghost.velocityX === 0 && ghost.velocityY === 0)) {
            const dirs = [[speed, 0], [-speed, 0], [0, speed], [0, -speed]];
            shuffleArray(dirs);
            let moved = false;
            for (let d of dirs) {
                if (!collidesWithWall(ghost, d[0], d[1])) {
                    ghost.velocityX = d[0];
                    ghost.velocityY = d[1];
                    moved = true;
                    break;
                }
            }
            if (!moved) continue;
        }

        // At intersections, randomly choose to turn
        if (Math.random() < 0.05) {
            const dirs = [[speed, 0], [-speed, 0], [0, speed], [0, -speed]];
            shuffleArray(dirs);
            for (let d of dirs) {
                if (!collidesWithWall(ghost, d[0], d[1])) {
                    ghost.velocityX = d[0];
                    ghost.velocityY = d[1];
                    break;
                }
            }
        }

        ghost.xCoordinate += ghost.velocityX;
        ghost.yCoordinate += ghost.velocityY;

        // Wrap
        if (ghost.xCoordinate < -tileSize) ghost.xCoordinate = boardWidth;
        if (ghost.xCoordinate > boardWidth) ghost.xCoordinate = -tileSize;

        // Update ghost image
        if (!scaredMode) {
            if (ghost.color === 'blue') ghost.image = blueGhostImage;
            else if (ghost.color === 'orange') ghost.image = orangeGhostImage;
            else if (ghost.color === 'pink') ghost.image = pinkGhostImage;
            else if (ghost.color === 'red') ghost.image = redGhostImage;
        } else {
            ghost.image = scaredGhostImage;
        }
    }
}

function checkCoinCollision() {
    for (let coin of [...coins]) {
        if (collides(pacman, coin)) {
            coins.delete(coin);
            score += 10;
        }
    }
    for (let pellet of [...powerPellets]) {
        if (collides(pacman, pellet)) {
            powerPellets.delete(pellet);
            score += 50;
            activateScaredMode();
        }
    }
}

function checkGhostCollision() {
    for (let ghost of [...ghosts]) {
        if (collides(pacman, ghost)) {
            if (scaredMode) {
                // Eat the ghost
                ghosts.delete(ghost);
                score += 200;
            } else {
                // Lose a life
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                } else {
                    resetPositions();
                }
                return;
            }
        }
    }
}

function checkWin() {
    if (coins.size === 0 && powerPellets.size === 0) {
        gameWon = true;
    }
}

function resetPositions() {
    // Reset pacman
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < columnCount; col++) {
            if (tileMap[row][col] === 'P') {
                pacman.xCoordinate = col * tileSize;
                pacman.yCoordinate = row * tileSize;
                pacman.velocityX = 0;
                pacman.velocityY = 0;
                pacman.nextVX = 0;
                pacman.nextVY = 0;
            }
        }
    }
    // Reset ghosts
    for (let ghost of ghosts) {
        ghost.xCoordinate = ghost.startX;
        ghost.yCoordinate = ghost.startY;
        setRandomDirection(ghost);
    }
    endScaredMode();
}

function activateScaredMode() {
    scaredMode = true;
    scaredTimer = SCARED_DURATION;
    for (let ghost of ghosts) {
        ghost.image = scaredGhostImage;
    }
}

function endScaredMode() {
    scaredMode = false;
    scaredTimer = 0;
    for (let ghost of ghosts) {
        if (ghost.color === 'blue') ghost.image = blueGhostImage;
        else if (ghost.color === 'orange') ghost.image = orangeGhostImage;
        else if (ghost.color === 'pink') ghost.image = pinkGhostImage;
        else if (ghost.color === 'red') ghost.image = redGhostImage;
    }
}

function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    gameWon = false;
    scaredMode = false;
    scaredTimer = 0;
    loadMap();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ==================== DRAW ====================
function draw() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    // Walls
    for (let wall of walls) {
        context.drawImage(wall.image, wall.xCoordinate, wall.yCoordinate, wall.blockWidth, wall.blockHeight);
    }

    // Coins
    context.fillStyle = "#FFE566";
    for (let coin of coins) {
        context.beginPath();
        context.arc(
            coin.xCoordinate + coin.blockWidth / 2,
            coin.yCoordinate + coin.blockHeight / 2,
            3, 0, Math.PI * 2
        );
        context.fill();
    }

    // Power Pellets
    for (let pellet of powerPellets) {
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200);
        context.fillStyle = `rgba(255, 220, 80, ${pulse})`;
        context.beginPath();
        context.arc(
            pellet.xCoordinate + pellet.blockWidth / 2,
            pellet.yCoordinate + pellet.blockHeight / 2,
            7, 0, Math.PI * 2
        );
        context.fill();

        // Glow
        context.shadowBlur = 12;
        context.shadowColor = "#FFD700";
        context.fill();
        context.shadowBlur = 0;
    }

    // Ghosts
    for (let ghost of ghosts) {
        context.drawImage(ghost.image, ghost.xCoordinate, ghost.yCoordinate, ghost.blockWidth, ghost.blockHeight);
    }

    // Pac-Man
    context.drawImage(pacman.image, pacman.xCoordinate, pacman.yCoordinate, pacman.blockWidth, pacman.blockHeight);

    // HUD
    drawHUD();

    // Overlays
    if (gameOver) drawOverlay("GAME OVER", "Press Enter to restart");
    if (gameWon) drawOverlay("YOU WIN! 🎉", `Score: ${score} — Press Enter to play again`);
}

function drawHUD() {
    // HUD bar
    context.fillStyle = "rgba(0,0,0,0.7)";
    context.fillRect(0, boardHeight - 32, boardWidth, 32);

    // Score
    context.fillStyle = "#FFE566";
    context.font = "bold 16px 'Courier New', monospace";
    context.textAlign = "left";
    context.fillText(`SCORE: ${score}`, 10, boardHeight - 10);

    // Lives as pac-man icons
    context.fillStyle = "#FFE566";
    context.textAlign = "right";
    let livesStr = "";
    for (let i = 0; i < lives; i++) livesStr += "◉ ";
    context.fillText(`LIVES: ${livesStr}`, boardWidth - 10, boardHeight - 10);

    // Scared mode timer bar
    if (scaredMode) {
        const ratio = scaredTimer / SCARED_DURATION;
        context.fillStyle = `rgba(0, 150, 255, ${0.4 + 0.3 * Math.sin(Date.now() / 100)})`;
        context.fillRect(0, boardHeight - 34, boardWidth * ratio, 3);
    }
}

function drawOverlay(title, subtitle) {
    // Darkened overlay
    context.fillStyle = "rgba(0, 0, 0, 0.75)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Animated glow title
    const glow = 8 + 4 * Math.sin(Date.now() / 300);
    context.shadowBlur = glow;
    context.shadowColor = gameOver ? "#FF4444" : "#FFE566";

    context.fillStyle = gameOver ? "#FF6666" : "#FFE566";
    context.font = `bold 36px 'Courier New', monospace`;
    context.textAlign = "center";
    context.fillText(title, boardWidth / 2, boardHeight / 2 - 20);

    context.shadowBlur = 0;
    context.fillStyle = "#CCCCCC";
    context.font = `16px 'Courier New', monospace`;
    context.fillText(subtitle, boardWidth / 2, boardHeight / 2 + 20);

    context.fillStyle = "#888";
    context.font = `13px 'Courier New', monospace`;
    context.fillText(`Final Score: ${score}`, boardWidth / 2, boardHeight / 2 + 50);
}

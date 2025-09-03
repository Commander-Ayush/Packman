//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount*tileSize;
const boardHeight = rowCount * tileSize;
let context;

//images
let blueGhostImage;
let greenGhostImage;
let redGhostImage;
let pinkGhostImage;
let orangeGhostImage;
let scaredGhostImage;
let pacmanUpImage;
let wallImage;
let pacmanDownImage;
let pacmanLeftImage
let pacmanRightImage;
let cherry;
let cherry2;


//<---------------onload Function--------------->
window.onload = function(){
    board=document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    loadImage();
    loadMap();
    update();
}

function update(){
    //move();
    draw();
    setTimeout(update, 50);
}

function draw(){
    context.drawImage(pacman.image, pacman.xCoordinate, pacman.yCoordinate, pacman.blockWidth, pacman.blockHeight);
    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image, ghost.xCoordinate, ghost.yCoordinate, ghost.blockWidth, ghost.blockHeight )
    }
    for(let wall of walls.values()){
        context.drawImage(wall.image, wall.xCoordinate, wall.yCoordinate, wall.blockWidth, wall.blockHeight);
    }
    

}


//<-----------------Image Loader----------------->
function loadImage(){
    wallImage = new Image();
    wallImage.src="./wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./blueGhost.png"

    redGhostImage = new Image();
    redGhostImage.src = "./redGhost.png"

    pinkGhostImage = new Image();
    pinkGhostImage.src = "./pinkGhost.png"

    orangeGhostImage = new Image();
    orangeGhostImage.src = "./orangeGhost.png"

    scaredGhostImage = new Image();
    scaredGhostImage.src = "./scaredGhost.png"

    pacmanDownImage = new Image();
    pacmanDownImage.src = "./pacmanDown.png"

    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./pacmanLeft.png"

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./pacmanUp.png"

    pacmanRightImage = new Image();
    pacmanRightImage.src = "./pacmanRight.png";
}

//<--------------------Tile Map--------------------->
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

const walls = new Set();
const ghosts = new Set();
const coins  = new Set();
let pacman;

function loadMap(){
    walls.clear();
    coins.clear();
    ghosts.clear();

    for(let row = 0; row<rowCount; row++){
        for(let columnElement = 0; columnElement<columnCount;columnElement++){
            const rows = tileMap[row];
            const tileMapChar = rows[columnElement];

            const xPosition = columnElement*tileSize;
            const yPosition = row*tileSize;

            if(tileMapChar == 'X'){ //block wall
                const wall = new Block(wallImage, xPosition, yPosition, tileSize, tileSize);
                walls.add(wall);
            }
            else if(tileMapChar == 'b'){ //blue Ghost
                const ghost = new Block(blueGhostImage, xPosition, yPosition, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'o'){ //orange Ghost
                const ghost = new Block(orangeGhostImage, xPosition, yPosition, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'p'){ //pink Ghost
                const ghost = new Block(pinkGhostImage, xPosition, yPosition, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == 'r'){ //red Ghost
                const ghost = new Block(redGhostImage, xPosition, yPosition, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if(tileMapChar == "P"){ //Pacman
                pacman = new Block(pacmanLeftImage, xPosition, yPosition, tileSize, tileSize);
            }
            else if(tileMapChar == " "){ //Coins
                const coin = new Block(null, xPosition+14, yPosition+14, 4, 4);
                coins.add(coin);
            }
        }
    }
}

//<-----------------------Blocks------------------------------->

class Block{
    constructor(image, x, y, width, height){
        this.image = image;
        this.xCoordinate=x;
        this.yCoordinate=y;
        this.blockWidth=width;
        this.blockHeight=height;

        this.startX = x;
        this.startY = y;
    }
}

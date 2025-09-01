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


window.onload = function(){
    board=document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
}

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
    pacmanRightImage.src = "./pacmanRight";
}

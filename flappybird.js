//board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/7;
let birdY = boardHeight/2;
let birdImg;
let canFly = false;
let inIdleState = true;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}


//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = boardHeight;
let pipeX = boardWidth;
let pipeY = 0;
let pipeTimes = 1000; //every 2 seconds

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -5; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.5;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, pipeTimes); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        canFly = false;
    }

    //pipes
    if(canFly) {
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
                canFly = false;
            }

            if(score == 10) {
                velocityX = -6;
            }
            else if (score == 20) {
                velocityX = -7;
                gravity = 0.6;
            }
            else if (score == 30) {
                velocityX = -8;
                gravity = 0.7;
            }
            else if (score == 40) {
                velocityX = -9;
                gravity = 0.9;
            }
            else if (score == 50) {
                velocityX = -10;
                gravity = 1.0;
                pipeTimes = 5;
            }
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    if(!inIdleState) {
        //score
        context.fillStyle = "white";
        context.font="50px Impact";
        context.lineWidth = 3;
        context.strokeStyle = "black";
        context.strokeText(score, boardWidth/2 - 25, 45);
        context.fillText(score, boardWidth/2 - 25, 45);
    }
    else {
        idleStateSim();
    }

    if (gameOver) {
        context.lineWidth = 4; // increase the outline width
        context.strokeStyle = "black";
        context.strokeText("GAME OVER", boardWidth/2 - 120, 100);
        context.fillText("GAME OVER", boardWidth/2 - 120, 100);
    }
    
}

function placePipes() {
    if (gameOver || !canFly || inIdleState) {
        pipeArray = [];
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);

    console.log(pipeArray);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -10;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            pipeArray = [];
            velocityX = -5;
            velocityY = 0;
            gravity = 0.5;
            pipeTimes = 2000;
            inIdleState = true;
        }
        else {
            canFly = true;
            inIdleState = false;
        }
    }
}

function idleStateSim() {
    //make the bird hover
    inIdleState = true;
    let random = 1 + Math.random()*1.5;
    if (bird.y >= boardHeight/random) {
        velocityY = -10;
    }

    context.fillStyle = "white";
    context.font="50px Impact";
    context.lineWidth = 5;
    context.strokeStyle = "black";
    context.globalAlpha = Math.abs(Math.sin(Date.now() / 850)); // pulse in opacity
    context.strokeText("Press Space to Start", boardWidth/2 - 250, 100);
    context.fillText("Press Space to Start", boardWidth/2 - 250, 100);
    context.globalAlpha = 1; // reset opacity
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

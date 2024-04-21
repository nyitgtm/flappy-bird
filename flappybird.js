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

//name
let name = "!@#"

//pipe images
let pipeImgArray = [["Assets/toppipe.png", "Assets/bottompipe.png"], ["Assets/topnyit.png", "Assets/bottomnyit.png"], ["Assets/topsol.png", "Assets/bottomsol.png"]];
//random number from 0 to 3
let srcPicForPipeNum = 0;

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
    birdImg.src = "Assets/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    bottomPipeImg = new Image();
    
    // topPipeImg.src = "Assets/toppipe.png";
    // bottomPipeImg.src = "Assets/bottompipe.png";

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
        context.strokeText("GAME OVER", boardWidth/2 - 112.5, 100);
        context.fillText("GAME OVER", boardWidth/2 - 112.5, 100);
        showLeaderboard();
    }

    if (score % 10 == 0 && score != 0) {
        // srcPicForPipeNum = Math.floor(Math.random() * (pipeImgArray.length));
        if(srcPicForPipeNum >= pipeImgArray.length - 1) {
            srcPicForPipeNum = 0;
        }
        else {
            srcPicForPipeNum++;
        }
    }
    
}

function placePipes() {
    if (gameOver || !canFly || inIdleState) {
        pipeArray = [];
        return;
    }

    topPipeImg.src = pipeImgArray[srcPicForPipeNum][0];
    bottomPipeImg.src = pipeImgArray[srcPicForPipeNum][1];

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
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -10;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            score = 0;
            velocityX = -5;
            velocityY = 0;
            gravity = 0.5;
            pipeTimes = 2000;
            //gameOver = false;
            //inIdleState = true;
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
    context.strokeText("Press Space to Start", boardWidth/2 - 210, 100);
    context.fillText("Press Space to Start", boardWidth/2 - 210, 100);
    context.globalAlpha = 1; // reset opacity
}

function showLeaderboard() {
    if(name == "!@#") {
        name = prompt("Enter your name: ").trim();
        if(name == null) {
            name = "Anonymous";
        }
        else if (name.length == 0) {
            name = "Anonymous";
        }
        else if (name.length > 24) {
            name = name.substring(0, 19) + " ...";
        }
    }

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({name: name.substring(0, 24), score: score});
    leaderboard.sort((a, b) => b.score - a.score); //sort in descending order
    leaderboard = leaderboard.slice(0, 5); //only top 5 scores
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    //display leaderboard on screen
    context.fillStyle = "black";
    context.beginPath();
    context.moveTo(boardWidth/2 - 200 + 20, 150);
    context.lineTo(boardWidth/2 + 200 - 20, 150);
    context.quadraticCurveTo(boardWidth/2 + 200, 150, boardWidth/2 + 200, 150 + 20);
    context.lineTo(boardWidth/2 + 200, 150 + 350 - 20); 
    context.quadraticCurveTo(boardWidth/2 + 200, 150 + 350, boardWidth/2 + 200 - 20, 150 + 350);
    context.lineTo(boardWidth/2 - 200 + 20, 150 + 350); 
    context.quadraticCurveTo(boardWidth/2 - 200, 150 + 350, boardWidth/2 - 200, 150 + 350 - 20); 
    context.lineTo(boardWidth/2 - 200, 150 + 20);
    context.quadraticCurveTo(boardWidth/2 - 200, 150, boardWidth/2 - 200 + 20, 150);
    context.closePath();
    context.globalAlpha = 0.8;
    context.fill();
    context.globalAlpha = 1; 

    context.fillStyle = "white";
    context.font="30px Impact";
    context.lineWidth = 3;
    context.strokeStyle = "black";
    context.strokeText("Leaderboard", boardWidth/2 - 80, 200);
    context.fillText("Leaderboard", boardWidth/2 - 80, 200);
    for (let i = 0; i < leaderboard.length; i++) {
        let name = leaderboard[i].name;
        let score = leaderboard[i].score;
        let text = name + " : " + score;
        let textWidth = context.measureText(text).width;
        let textX = boardWidth/2 - textWidth/2;
        let textY = 250 + i*50;
        if (i === 0) {
            context.fillStyle = "gold";
        } else if (i === 1) {
            context.fillStyle = "blue";
        } else if (i === 2) {
            context.fillStyle = "brown";
        } else {
            context.fillStyle = "white";
        }
        context.strokeText(text, textX, textY);
        context.fillText(text, textX, textY);
    }

    //play again green button under the leaderboard
    context.fillStyle = "green";
    context.beginPath();
    context.moveTo(boardWidth/2 - 200 + 20, 520);
    context.lineTo(boardWidth/2 + 200 - 20, 520);
    context.quadraticCurveTo(boardWidth/2 + 200, 520, boardWidth/2 + 200, 520 + 20);
    context.lineTo(boardWidth/2 + 200, 580 - 20);
    context.quadraticCurveTo(boardWidth/2 + 200, 580, boardWidth/2 + 200 - 20, 580);
    context.lineTo(boardWidth/2 - 200 + 20, 580);
    context.quadraticCurveTo(boardWidth/2 - 200, 580, boardWidth/2 - 200, 580 - 20);
    context.lineTo(boardWidth/2 - 200, 520 + 20);
    context.quadraticCurveTo(boardWidth/2 - 200, 520, boardWidth/2 - 200 + 20, 520);
    context.closePath();
    context.fill();

    context.fillStyle = "white";
    context.font="30px Impact";
    context.lineWidth = 3;
    context.strokeStyle = "black";
    let text = "Play Again";
    let textWidth = context.measureText(text).width;
    let textX = boardWidth/2 - textWidth/2;
    let textY = 560;
    context.strokeText(text, textX, textY);
    context.fillText(text, textX, textY);

    //when user clicks this button -> reset the game
    board.addEventListener("mousemove", function(event) {
        let x = event.clientX - board.getBoundingClientRect().left;
        let y = event.clientY - board.getBoundingClientRect().top;
        if (x >= boardWidth/2 - 200 + 20 && x <= boardWidth/2 + 200 - 20 && y >= 520 && y <= 580) {
            board.style.cursor = "pointer";
        } else {
            board.style.cursor = "default";
        }
    });

    board.addEventListener("click", function(event) {
        let x = event.clientX - board.getBoundingClientRect().left;
        let y = event.clientY - board.getBoundingClientRect().top;
        if (x >= boardWidth/2 - 200 + 20 && x <= boardWidth/2 + 200 - 20 && y >= 520 && y <= 580) {
            gameOver = false;
            canFly = false;
            inIdleState = true;
            bird.y = birdY;
            score = 0;
            velocityX = -5;
            velocityY = 0;
            gravity = 0.5;
            pipeTimes = 2000;
            pipeArray = [];
        }
    });

    console.log(leaderboard);
}

//reset leaderboard for debugging
document.addEventListener('keydown', function(event) {
    console.log(localStorage.getItem("leaderboard"));
    if (event.key === 'r') {
        localStorage.removeItem("leaderboard");
    }
});

function detectCollision(a, b) {
    return (a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y)    //a's bottom left corner passes b's top left corner
           || bird.y > board.height; //bird hits the ground  
}

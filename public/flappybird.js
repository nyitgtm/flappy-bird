//GLOBAL Variables
//Database stuff
//import { getHighestScoresServer, sendScoresServer } from './app.js';

//board variables
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//bird variables
let birdWidth = 34; 
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

//pipes variables
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = boardHeight;
let pipeX = boardWidth;
let pipeY = 0;
let pipeTimes = 1000; 
let topPipeImg;
let bottomPipeImg;
let pipeImgArray = [["Assets/toppipe.png", "Assets/bottompipe.png"], ["Assets/topnyit.png", "Assets/bottomnyit.png"], ["Assets/topsol.png", "Assets/bottomsol.png"]];
let srcPicForPipeNum = 0;

//physics
let velocityX = -5; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.5;

//game variables
let gameOver = false;
let score = 0;
let name = "!@#"
let previousScore = 0;
let localLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];



//FUNCTIONS

window.onload = function() {
    //create canvas
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    //load images
    birdImg = new Image();
    birdImg.src = "Assets/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    topPipeImg = new Image();
    bottomPipeImg = new Image();

    requestAnimationFrame(update); //game loop
    setInterval(placePipes, pipeTimes);  //place pipes every 1 second
    document.addEventListener("keydown", moveBird); //move bird on key press
}

//game loop
function update() {
    //call update function again for each frame
    requestAnimationFrame(update);

    //clear canvas if game is over
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird logic
    velocityY += gravity; //apply gravity to velocityY
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); //draw bird

    //If the game is playing
    if(canFly) {
        //pipe logic
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
            
            //if bird passes the pipe, increase score
            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
                pipe.passed = true;
            }

            //if bird hits the pipe, game over
            if (detectCollision(bird, pipe)) {
                gameOver = true;
                canFly = false;
            }

            //if bird passes the pipe, increase the speed depending on the score
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

    //clear pipes after they pass the screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //draw score
    if(!inIdleState) {
        context.fillStyle = "white"; // Set the fill style to white
        context.font = "50px Impact"; // Set the font to 50px Impact
        context.lineWidth = 3; // Set the line width to 3
        context.strokeStyle = "black"; // Set the stroke style to black
        context.strokeText(score, boardWidth/2 - 25, 45); // Draw the score as a stroked text on the canvas
        context.fillText(score, boardWidth/2 - 25, 45); // Draw the score as a filled text on the canvas
    }
    else {
        idleStateSim(); //simulate idle state
    }

    //display gameover and leaderboard
    if (gameOver) {
        context.lineWidth = 4; // increase the outline width
        context.strokeStyle = "black"; // Set the stroke style to black
        context.strokeText("GAME OVER", boardWidth/2 - 112.5, 100); // Draw the game over text as a stroked text on the canvas
        context.fillText("GAME OVER", boardWidth/2 - 112.5, 100); // Draw the game over text as a filled text on the canvas
        showLeaderboard(); //show leaderboard
    }

    //change pipe image every 10 points for aesthetic purposes
    if (score % 10 == 0 && score != 0 && previousScore != score) {
        previousScore = score;
        if(srcPicForPipeNum >= pipeImgArray.length - 1) {
            srcPicForPipeNum = 0;
        }
        else {
            srcPicForPipeNum++;
        }
    }
}

//place pipes on the screen
function placePipes() {
    //clear pipes if gameover, can't fly or in idle state
    if (gameOver || !canFly || inIdleState) {
        pipeArray = [];
        return;
    }

    //update paths for src files
    topPipeImg.src = pipeImgArray[srcPicForPipeNum][0];
    bottomPipeImg.src = pipeImgArray[srcPicForPipeNum][1];

    //randomize the pipe height
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
    pipeArray.push(topPipe); //add top pipe to the array
    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe); //add bottom pipe to the array
}

//move bird on key press
function moveBird(e) {
    if (e.code == "Space") {
        velocityY = -10;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            score = 0;
            velocityX = -5;
            velocityY = 0;
            gravity = 0.5;
            pipeTimes = 2000;
        }
        else {
            canFly = true;
            inIdleState = false;
        }
    }
}

//simulate idle state
function idleStateSim() {
    inIdleState = true;
    let random = 1 + Math.random()*1.5;
    if (bird.y >= boardHeight/random) {
        velocityY = -10;
    }

    //draw press space to start text
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
    // Get the highest scores from the server
    if(name == "!@#") {
        name = prompt("Enter your name: ").trim();

        //filtering the names
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

    fetch('/getHighestScores')
        .then(response => response.json())
        .then(data => {
            leaderboard = data;
            if(score > leaderboard[leaderboard.length - 1].score || leaderboard.length < 5) {
                fetch('/sendScore', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: name, score: score })
                })
                .catch(error => {
                    console.error('Error sending score:', error);
                });
                //add to the leaderboard so we dont have to make another request
                leaderboard.push({name: name, score: score});
                leaderboard.sort((a, b) => b.score - a.score);
                leaderboard = leaderboard.slice(0, 5);
            }
            showLeaderboardHelper(leaderboard);

        })
        .catch(error => {
            console.log("Error retriivng scores: ", error);

            //Draw message on bottom of the screen that the server is down
            context.fillStyle = "white";
            context.font="50px Impact";
            context.lineWidth = 3;
            context.strokeStyle = "red";
            context.strokeText("Server is down!", boardWidth/2 - 160, 200 + 430);
            context.fillText("Server is down!", boardWidth/2 - 160, 200 + 430);

            localLeaderboard.push({name: name.substring(0, 24), score: score});
            localLeaderboard.sort((a, b) => b.score - a.score);
            localLeaderboard = localLeaderboard.slice(0, 5);
            localStorage.setItem("leaderboard", JSON.stringify(localLeaderboard));
            showLeaderboardHelper(localLeaderboard);
        });
    

}


//show leaderboard
function showLeaderboardHelper(leaderboard) {
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

    //writing names and scores on the leaderboard
    context.fillStyle = "white";
    context.font="30px Impact";
    context.lineWidth = 3;
    context.strokeStyle = "black";
    context.strokeText("Leaderboard", boardWidth/2 - 80, 200);
    context.fillText("Leaderboard", boardWidth/2 - 80, 200);
    //display the top 5 scores
    for (let i = 0; i < leaderboard.length; i++) {
        let name = leaderboard[i].name; 
        let score = leaderboard[i].score;
        let text = name + " : " + score;
        let textWidth = context.measureText(text).width;
        let textX = boardWidth/2 - textWidth/2;
        let textY = 250 + i*50;
        //filtering top 3 scores to accordingly colors
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

    //code behind reseting the game
    board.addEventListener("click", function(event) {
        let x = event.clientX - board.getBoundingClientRect().left;
        let y = event.clientY - board.getBoundingClientRect().top;
        if (x >= boardWidth/2 - 200 + 20 && x <= boardWidth/2 + 200 - 20 && y >= 520 && y <= 580 && gameOver) {
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
}

//reset leaderboard
document.addEventListener('keydown', function(event) {
    //console.log(localStorage.getItem("leaderboard"));
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

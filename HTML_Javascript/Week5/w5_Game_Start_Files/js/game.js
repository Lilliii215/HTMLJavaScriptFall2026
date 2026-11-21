/*
START PROGRAM

    Display home screen
    Display Game Title "SPIT AND RUN"
    Display Start Button

    Player Clicks Start Button

    If button is clicked starts game

        START GAME

    Set score = 0
    Set timer = 120 seconds (2 minutes)
    Set winning score = 50

    Create player (the alpaca)

    While game is running

        Allow player to move around the zoo using W,A,S,D

        If player spits at a civilian
            Add 1 point to score
        End if

        If player spits at a zookeeper
            Add 5 points to score
        End If

        If player touches a zookeeper
            Display "You were captured" Screen
            Restart Game
        End If

        Count down timer from 120 seconds (2 minutes)

        Display score in the game
        Display timer in the upper left corner

        If score >= 50
            Display "YOU WIN!"
            Display "The alpaca escaped the zoo!"
            End Game
        End If

        If timer <= 0
            Display "TIME'S UP!"
            Display "GAME OVER"
            Restart Game
        End If

    End While

END GAME
*/


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

var fps = 1000 / 60;
var timer = setInterval(game, fps);

// Game settings
var score = 0;
var winningScore = 50;
var timeLeft = 120;

var spit = [];
var shootCooldown = 0;
var startCooldown = 0;

var acceleration = 0.35;
var friction = 0.9;

var states = "title";

// Controls
var a = false;
var d = false;
var w = false;
var s = false;
var space = false;
var enter = false;

// Images and sounds
var alpacaImage = document.getElementById("alpaca");
var civilianImage = document.getElementById("dudes");
var keeperImage = document.getElementById("keeper");

var spitSound = new Audio("audio/velcro-strap-2.mp3");
var civilianHitSound = new Audio("audio/Week5_audio_man-scream-01.mp3");
var keeperDie = new Audio("audio/Week5_audio_man-scream-01.mp3");

// Respawn after 5 seconds
var respawnTime = 5 * 60;

// PLAYER
var alpacaSprite = {
    image: alpacaImage,
    x: canvas.width / 2 - 95 / 2,
    y: canvas.height / 2 - 95 / 2,
    width: 95,
    height: 95,
    moveX: 0,
    moveY: 0,
    direction: 1,
    hitboxX: 15,
    hitboxY: 14,
    hitboxWidth: 69,
    hitboxHeight: 72
};

// CIVILIANS
function createDudes() {
    return {
        image: civilianImage,
        x: Math.random() * (canvas.width - 85),
        y: Math.random() * (canvas.height - 98),
        width: 85,
        height: 98,
        moveX: (Math.random() * 2 - 1) * 0.8,
        moveY: (Math.random() * 2 - 1) * 0.8,
        direction: 1,

        // Updated civilian hitbox
        hitboxX: 11,
        hitboxY: 8,
        hitboxWidth: 63,
        hitboxHeight: 86,

        active: true,
        respawnTimer: 0
    };
}

var dudes = [];
var dudesCount = 4;

for (var i = 0; i < dudesCount; i++) {
    dudes.push(createDudes());
}

// ZOOKEEPERS
function createKeepers() {
    return {
        image: keeperImage,
        x: rand(0, canvas.width - 100),
        y: rand(0, canvas.height - 100),
        width: 100,
        height: 100,
        moveX: randomNegOneAndOne() * 0.7,
        moveY: randomNegOneAndOne() * 0.7,
        direction: 1,

        // Updated zookeeper hitbox
        hitboxX: 17,
        hitboxY: 11,
        hitboxWidth: 66,
        hitboxHeight: 82,

        active: true,
        respawnTimer: 0
    };
}

var keepers = [];
var numberofKeepers = 3;

for (var i = 0; i < numberofKeepers; i++) {
    keepers.push(createKeepers());
}

// KEYBOARD CONTROLS
document.addEventListener("keydown", function(e) {
    var key = e.key.toLowerCase();

    if (key === "a") a = true;
    if (key === "d") d = true;
    if (key === "w") w = true;
    if (key === "s") s = true;

    if (e.code === "Space") {
        space = true;
        e.preventDefault();
    }

    if (key === "enter") {
        enter = true;
    }
});

document.addEventListener("keyup", function(e) {
    var key = e.key.toLowerCase();

    if (key === "a") a = false;
    if (key === "d") d = false;
    if (key === "w") w = false;
    if (key === "s") s = false;

    if (e.code === "Space") space = false;
    if (key === "enter") enter = false;
});

// CLICK MENU, START, BACK, AND RESTART BUTTONS
canvas.addEventListener("click", function(e) {
    var rect = canvas.getBoundingClientRect();

    var mouseX = (e.clientX - rect.left) *
        (canvas.width / rect.width);
    var mouseY = (e.clientY - rect.top) *
        (canvas.height / rect.height);

    var centerX = canvas.width / 2;

    // Home screen buttons
    if (states === "title") {
        // START GAME button
        if (
            mouseX >= centerX - 110 &&
            mouseX <= centerX + 110 &&
            mouseY >= canvas.height / 2 + 90 &&
            mouseY <= canvas.height / 2 + 150
        ) {
            startGame();
            return;
        }

        // INSTRUCTIONS button
        if (
            mouseX >= centerX - 110 &&
            mouseX <= centerX + 110 &&
            mouseY >= canvas.height / 2 + 165 &&
            mouseY <= canvas.height / 2 + 225
        ) {
            states = "instructions";
            return;
        }
    }

    // Back button on the instructions screen
    if (
        states === "instructions" &&
        mouseX >= centerX - 110 &&
        mouseX <= centerX + 110 &&
        mouseY >= canvas.height / 2 + 180 &&
        mouseY <= canvas.height / 2 + 240
    ) {
        states = "title";
        return;
    }

    // Restart buttons on the game-over and win screens
    if (
        (states === "over" || states === "win") &&
        mouseX >= centerX - 100 &&
        mouseX <= centerX + 100 &&
        mouseY >= canvas.height / 2 + 100 &&
        mouseY <= canvas.height / 2 + 180
    ) {
        startGame();
    }
});

// START OR RESTART GAME
function startGame() {
    score = 0;
    timeLeft = 120;

    spit = [];
    shootCooldown = 0;
    startCooldown = 60;

    alpacaSprite.x = canvas.width / 2 - alpacaSprite.width / 2;
    alpacaSprite.y = canvas.height / 2 - alpacaSprite.height / 2;
    alpacaSprite.moveX = 0;
    alpacaSprite.moveY = 0;

    dudes = [];

    for (var i = 0; i < dudesCount; i++) {
        dudes.push(createDudes());
    }

    keepers = [];

    for (var k = 0; k < numberofKeepers; k++) {
        keepers.push(createKeepers());
    }

    states = "game";
}

// MAIN GAME FUNCTION
function game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (states) {
        case "title":
            displayTitleScreen();
            break;

        case "game":
            playGame();
            break;

        case "instructions":
            displayInstructionsScreen();
            break;

        case "over":
            displayGameOver();
            break;

        case "win":
            displayWinScreen();
            break;
    }
}

// HOME SCREEN
function displayTitleScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";

    var titleText = "SPIT AND RUN";

    ctx.fillText(
        titleText,
        canvas.width / 2 - ctx.measureText(titleText).width / 2,
        canvas.height / 2 - 90
    );

    ctx.font = "16px Arial";

    var instructionText = "You are an alpaca trying to escape the zoo! Good luck!";

    ctx.fillText(
        instructionText,
        canvas.width / 2 - ctx.measureText(instructionText).width / 2,
        canvas.height / 2 - 35
    );

    drawMenuButton("START GAME", canvas.height / 2 + 90);
    drawMenuButton("INSTRUCTIONS", canvas.height / 2 + 165);

    if (enter) {
        enter = false;
        startGame();
    }
}

// INSTRUCTIONS SCREEN
function displayInstructionsScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "42px Arial";

    var heading = "INSTRUCTIONS";

    ctx.fillText(
        heading,
        canvas.width / 2 - ctx.measureText(heading).width / 2,
        canvas.height / 2 - 145
    );

    var instructions =
        "Use W, A, S, D to move and SPACE to spit. Zookeepers will try to capture you, spit at them to make them to gain 5 points. Spit at civilians to gain 1 point, but be careful not to get caught. In order to escape the zoo you need 50 points! Good luck!";

    // Wrap text to fit the screen
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    var words = instructions.split(" ");
    var lines = [];
    var line = "";
    var maxLineWidth = Math.min(canvas.width - 100, 650);

    for (var i = 0; i < words.length; i++) {
        var testLine = line ? line + " " + words[i] : words[i];

        if (ctx.measureText(testLine).width > maxLineWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = testLine;
        }
    }

    if (line) {
        lines.push(line);
    }

    var lineHeight = 34;
    var firstLineY = canvas.height / 2 -
        ((lines.length - 1) * lineHeight) / 2;

    for (var j = 0; j < lines.length; j++) {
        ctx.fillText(
            lines[j],
            canvas.width / 2,
            firstLineY + j * lineHeight
        );
    }

    ctx.textAlign = "left";

    drawMenuButton("BACK", canvas.height / 2 + 180);

    if (enter) {
        enter = false;
        states = "title";
    }
}


// GAMEPLAY
function playGame() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (startCooldown > 0) {
        startCooldown--;
    }

    // Timer
    timeLeft -= 1 / 60;

    if (timeLeft <= 0) {
        timeLeft = 0;
        states = "over";
        return;
    }

    // PLAYER MOVEMENT
    if (a) alpacaSprite.moveX -= acceleration;
    if (d) alpacaSprite.moveX += acceleration;
    if (w) alpacaSprite.moveY -= acceleration;
    if (s) alpacaSprite.moveY += acceleration;

    alpacaSprite.moveX *= friction;
    alpacaSprite.moveY *= friction;

    alpacaSprite.x += alpacaSprite.moveX;
    alpacaSprite.y += alpacaSprite.moveY;

    // Player facing direction
    if (alpacaSprite.moveX < -0.1) {
        alpacaSprite.direction = -1;
    }

    if (alpacaSprite.moveX > 0.1) {
        alpacaSprite.direction = 1;
    }

    // Keep player inside canvas
    if (alpacaSprite.x < 0) {
        alpacaSprite.x = 0;
        alpacaSprite.moveX = 0;
    }

    if (alpacaSprite.x + alpacaSprite.width > canvas.width) {
        alpacaSprite.x = canvas.width - alpacaSprite.width;
        alpacaSprite.moveX = 0;
    }

    if (alpacaSprite.y < 0) {
        alpacaSprite.y = 0;
        alpacaSprite.moveY = 0;
    }

    if (alpacaSprite.y + alpacaSprite.height > canvas.height) {
        alpacaSprite.y = canvas.height - alpacaSprite.height;
        alpacaSprite.moveY = 0;
    }

    // SPIT COOLDOWN
    if (shootCooldown > 0) {
        shootCooldown--;
    }

    // SHOOT SPIT
    if (space && shootCooldown === 0) {
        spit.push({
            x: alpacaSprite.x + alpacaSprite.width / 2 - 2,
            y: alpacaSprite.y,
            width: 6,
            height: 8,
            speed: 10,
            color: "white"
        });

        spitSound.currentTime = 0;
        spitSound.play().catch(function() {});

        shootCooldown = 30;
    }

    //CIVILIANS
    for (var i = 0; i < dudes.length; i++) {
        var civilian = dudes[i];

        // Civilian respawn timer
        if (!civilian.active) {
            civilian.respawnTimer--;

            if (civilian.respawnTimer <= 0) {
                civilian.x = rand(0, canvas.width - civilian.width);
                civilian.y = rand(0, canvas.height - civilian.height);

                civilian.moveX = (Math.random() * 2 - 1) * 0.8;
                civilian.moveY = (Math.random() * 2 - 1) * 0.8;

                civilian.active = true;
            }

            continue;
        }

        civilian.x += civilian.moveX;
        civilian.y += civilian.moveY;

        // Civilian facing direction
        if (civilian.moveX < -0.05) {
            civilian.direction = -1;
        }

        if (civilian.moveX > 0.05) {
            civilian.direction = 1;
        }

        // Civilian canvas boundaries
        if (civilian.x <= 0) {
            civilian.x = 0;
            civilian.moveX = Math.abs(civilian.moveX);
        }

        if (civilian.x + civilian.width >= canvas.width) {
            civilian.x = canvas.width - civilian.width;
            civilian.moveX = -Math.abs(civilian.moveX);
        }

        if (civilian.y <= 0) {
            civilian.y = 0;
            civilian.moveY = Math.abs(civilian.moveY);
        }

        if (civilian.y + civilian.height >= canvas.height) {
            civilian.y = canvas.height - civilian.height;
            civilian.moveY = -Math.abs(civilian.moveY);
        }

        drawSprite(civilian);
    }

    // UPDATE ZOOKEEPERS
    for (var k = 0; k < keepers.length; k++) {
        var currentKeeper = keepers[k];

        // Zookeeper respawn timer
        if (!currentKeeper.active) {
            currentKeeper.respawnTimer--;

            if (currentKeeper.respawnTimer <= 0) {
                currentKeeper.x = rand(0, canvas.width - currentKeeper.width);
                currentKeeper.y = rand(0, canvas.height - currentKeeper.height);

                currentKeeper.moveX = randomNegOneAndOne() * 0.7;
                currentKeeper.moveY = randomNegOneAndOne() * 0.7;

                currentKeeper.active = true;
            }

            continue;
        }

        currentKeeper.x += currentKeeper.moveX;
        currentKeeper.y += currentKeeper.moveY;

        // Zookeeper facing direction
        if (currentKeeper.moveX < -0.05) {
            currentKeeper.direction = -1;
        }

        if (currentKeeper.moveX > 0.05) {
            currentKeeper.direction = 1;
        }

        // Zookeeper canvas boundaries
        if (currentKeeper.x < 0) {
            currentKeeper.x = 0;
            currentKeeper.moveX = Math.abs(currentKeeper.moveX);
        }

        if (currentKeeper.x > canvas.width - currentKeeper.width) {
            currentKeeper.x = canvas.width - currentKeeper.width;
            currentKeeper.moveX = -Math.abs(currentKeeper.moveX);
        }

        if (currentKeeper.y < 0) {
            currentKeeper.y = 0;
            currentKeeper.moveY = Math.abs(currentKeeper.moveY);
        }

        if (currentKeeper.y > canvas.height - currentKeeper.height) {
            currentKeeper.y = canvas.height - currentKeeper.height;
            currentKeeper.moveY = -Math.abs(currentKeeper.moveY);
        }

        drawSprite(currentKeeper);

        // Game over when alpaca and zookeeper hitboxes overlap
        if (
            startCooldown <= 0 &&
            rectanglesOverlap(alpacaSprite, currentKeeper)
        ) {
            states = "over";
            return;
        }
    }

   
    for (var j = spit.length - 1; j >= 0; j--) {
        var bullet = spit[j];

        bullet.y -= bullet.speed;

        // Remove spit that leaves screen
        if (bullet.y + bullet.height < 0) {
            spit.splice(j, 1);
            continue;
        }

        var hitSomething = false;

        // Check civilian collisions
        for (var c = 0; c < dudes.length; c++) {
            var civilianTarget = dudes[c];

            if (
                civilianTarget.active &&
                rectanglesOverlap(bullet, civilianTarget)
            ) {
                score += 1;

                // Play sound when spit hits civilian
                civilianHitSound.currentTime = 0;
                civilianHitSound.play().catch(function() {});

                // Civilian disappears for 5 seconds
                civilianTarget.active = false;
                civilianTarget.respawnTimer = respawnTime;

                hitSomething = true;
                break;
            }
        }

        // Check zookeeper collisions
        if (!hitSomething) {
            for (var z = 0; z < keepers.length; z++) {
                var keeperTarget = keepers[z];

                if (
                    keeperTarget.active &&
                    rectanglesOverlap(bullet, keeperTarget)
                ) {
                    score += 5;

                    keeperDie.currentTime = 0;
                    keeperDie.play().catch(function() {});

                    // Zookeeper disappears for 5 seconds
                    keeperTarget.active = false;
                    keeperTarget.respawnTimer = respawnTime;

                    hitSomething = true;
                    break;
                }
            }
        }

        if (hitSomething) {
            spit.splice(j, 1);
            continue;
        }

        // Draw spit
        ctx.fillStyle = bullet.color;
        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    }

  
    drawSprite(alpacaSprite);

    // SCORE AND TIMER
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";

    ctx.fillText("Score: " + score, 20, 35);
    ctx.fillText("Time: " + Math.ceil(timeLeft), 20, 65);


    if (score >= winningScore) {
        states = "win";
    }
}

// DRAW BUTTON
function drawButton(text) {
    ctx.fillStyle = "pink";

    ctx.fillRect(
        canvas.width / 2 - 100,
        canvas.height / 2 + 100,
        200,
        80
    );

    ctx.fillStyle = "black";
    ctx.font = "24px Arial";

    ctx.fillText(
        text,
        canvas.width / 2 - ctx.measureText(text).width / 2,
        canvas.height / 2 + 148
    );
}

//HOME SCREEN AND INSTRUCTIONS BUTTONS
function drawMenuButton(text, y) {
    var buttonWidth = 220;
    var buttonHeight = 60;
    var buttonX = canvas.width / 2 - buttonWidth / 2;

    ctx.fillStyle = "pink";
    ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);

    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, y + buttonHeight / 2);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
}

// GAME OVER SCREEN
function displayGameOver() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "42px Arial";

    var message = timeLeft <= 0
        ? "TIMES UP! GAME OVER"
        : "YOU WERE CAPTURED!";

    ctx.fillText(
        message,
        canvas.width / 2 - ctx.measureText(message).width / 2,
        canvas.height / 2 - 20
    );

    ctx.font = "18px Arial";

    var instruction = "Press ENTER or click below to play again";

    ctx.fillText(
        instruction,
        canvas.width / 2 - ctx.measureText(instruction).width / 2,
        canvas.height / 2 + 40
    );

    drawButton("RESTART GAME");

    if (enter) {
        enter = false;
        startGame();
    }
}

// WIN SCREEN
function displayWinScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "42px Arial";

    var message = "YOU WIN!";

    ctx.fillText(
        message,
        canvas.width / 2 - ctx.measureText(message).width / 2,
        canvas.height / 2 - 40
    );

    ctx.font = "22px Arial";

    var winText = "ALPACA ESCAPED THE ZOO!";

    ctx.fillText(
        winText,
        canvas.width / 2 - ctx.measureText(winText).width / 2,
        canvas.height / 2 + 10
    );

    ctx.font = "18px Arial";

    var instruction = "Press ENTER or click below to play again";

    ctx.fillText(
        instruction,
        canvas.width / 2 - ctx.measureText(instruction).width / 2,
        canvas.height / 2 + 60
    );

    drawButton("PLAY AGAIN");

    if (enter) {
        enter = false;
        startGame();
    }
}

function drawSprite(sprite) {
    ctx.save();

    if (sprite.direction === 1) {
        ctx.translate(
            sprite.x + sprite.width,
            sprite.y
        );

        ctx.scale(-1, 1);

        if (
            sprite.image &&
            sprite.image.complete &&
            sprite.image.naturalWidth > 0
        ) {
            ctx.drawImage(
                sprite.image,
                0,
                0,
                sprite.width,
                sprite.height
            );
        } else {
            ctx.fillStyle = "white";
            ctx.fillRect(
                0,
                0,
                sprite.width,
                sprite.height
            );
        }
    } else {
        if (
            sprite.image &&
            sprite.image.complete &&
            sprite.image.naturalWidth > 0
        ) {
            ctx.drawImage(
                sprite.image,
                sprite.x,
                sprite.y,
                sprite.width,
                sprite.height
            );
        } else {
            ctx.fillStyle = "white";
            ctx.fillRect(
                sprite.x,
                sprite.y,
                sprite.width,
                sprite.height
            );
        }
    }

    ctx.restore();
}

// GET HITBOX
function getHitbox(object) {
    return {
        x: object.x + (object.hitboxX ?? 0),
        y: object.y + (object.hitboxY ?? 0),
        width: object.hitboxWidth ?? object.width,
        height: object.hitboxHeight ?? object.height
    };
}


function rectanglesOverlap(first, second) {
    var firstBox = getHitbox(first);
    var secondBox = getHitbox(second);

    return (
        firstBox.x < secondBox.x + secondBox.width &&
        firstBox.x + firstBox.width > secondBox.x &&
        firstBox.y < secondBox.y + secondBox.height &&
        firstBox.y + firstBox.height > secondBox.y
    );
}

function switchScenes(nameOfScene) {
    states = nameOfScene;
}

function rand(_low, _high) {
    return Math.random() * (_high - _low) + _low;
}

function randomNegOneAndOne() {
    return Math.random() > 0.5 ? 1 : -1;
}
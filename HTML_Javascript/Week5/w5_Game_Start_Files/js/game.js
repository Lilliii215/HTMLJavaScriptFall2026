/*-------------------------------------------
Game Setup
 1. canvas 
 2. context
 3. frame rate
 4. animation timer runs main function 60 frames per second
-------------------------------------------*/





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

END GAME*/




// START PROGRAM

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Make scaled character images smoother
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

// Keyboard controls
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
var keeperDie = new Audio("audio/man-scream-01.mp3");

// Respawn settings
var respawnTime = 5 * 60;

// Player
var alpacaSprite = {
    image: alpacaImage,
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 70,
    height: 70,
    moveX: 0,
    moveY: 0,
    direction: 1,
    hitboxX: 12,
    hitboxY: 10,
    hitboxWidth: 46,
    hitboxHeight: 55
};

// Create civilians
function createDudes() {
    return {
        image: civilianImage,
        x: Math.random() * (canvas.width - 65),
        y: Math.random() * (canvas.height - 75),
        width: 65,
        height: 75,
        moveX: (Math.random() * 2 - 1) * 0.8,
        moveY: (Math.random() * 2 - 1) * 0.8,
        direction: 1,
        active: true,
        respawnTimer: 0
    };
}

var dudes = [];
var dudesCount = 4;

for (var i = 0; i < dudesCount; i++) {
    dudes.push(createDudes());
}

// Create zookeepers
function createKeepers() {
    return {
        image: keeperImage,
        x: rand(0, canvas.width - 75),
        y: rand(0, canvas.height - 75),
        width: 75,
        height: 75,
        moveX: randomNegOneAndOne() * 0.7,
        moveY: randomNegOneAndOne() * 0.7,
        direction: 1,
        hitboxX: 15,
        hitboxY: 10,
        hitboxWidth: 45,
        hitboxHeight: 58,
        active: true,
        respawnTimer: 0
    };
}

var keepers = [];
var numberofKeepers = 3;

for (var i = 0; i < numberofKeepers; i++) {
    keepers.push(createKeepers());
}

// Keyboard events
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

// Allow the Start Game button to be clicked
canvas.addEventListener("click", function(e) {
    var rect = canvas.getBoundingClientRect();

    var mouseX = (e.clientX - rect.left) *
        (canvas.width / rect.width);

    var mouseY = (e.clientY - rect.top) *
        (canvas.height / rect.height);

    var buttonX = canvas.width / 2 - 100;
    var buttonY = canvas.height / 2 + 100;

    if (
        (states === "title" || states === "over" || states === "win") &&
        mouseX >= buttonX &&
        mouseX <= buttonX + 200 &&
        mouseY >= buttonY &&
        mouseY <= buttonY + 80
    ) {
        startGame();
    }
});

// Start or restart the game
function startGame() {
    score = 0;
    timeLeft = 120;

    spit = [];
    shootCooldown = 0;
    startCooldown = 60;

    alpacaSprite.x = canvas.width / 2;
    alpacaSprite.y = canvas.height / 2;
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

// Main game function
function game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (states) {
        case "title":
            displayTitleScreen();
            break;

        case "game":
            playGame();
            break;

        case "over":
            displayGameOver();
            break;

        case "win":
            displayWinScreen();
            break;
    }
}

// Home screen
function displayTitleScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";

    var titleText = "SPIT AND RUN";

    ctx.fillText(
        titleText,
        canvas.width / 2 - ctx.measureText(titleText).width / 2,
        canvas.height / 2 - 20
    );

    ctx.font = "16px Arial";

    var instructionText =
        "Escape the zoo! Use W, A, S, D to move and SPACE to spit.";

    ctx.fillText(
        instructionText,
        canvas.width / 2 - ctx.measureText(instructionText).width / 2,
        canvas.height / 2 + 40
    );

    drawButton("START GAME");

    if (enter) {
        enter = false;
        startGame();
    }
}

// Main gameplay
function playGame() {
    // Background
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (startCooldown > 0) {
        startCooldown--;
    }

    // Countdown timer
    timeLeft -= 1 / 60;

    if (timeLeft <= 0) {
        timeLeft = 0;
        states = "over";
        return;
    }

    // Player movement
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

    // Keep player inside the canvas
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

    // Spit cooldown
    if (shootCooldown > 0) {
        shootCooldown--;
    }

    // Shoot spit using SPACE
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

    // Update civilians
    for (var i = 0; i < dudes.length; i++) {
        var civilian = dudes[i];

        // Handle civilian respawning
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

        // Bounce off canvas edges
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

    // Update zookeepers
    for (var k = 0; k < keepers.length; k++) {
        var currentKeeper = keepers[k];

        // Handle zookeeper respawning
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

        // Bounce off canvas edges
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

        // Game over when the custom hitboxes overlap
        if (
            startCooldown <= 0 &&
            rectanglesOverlap(alpacaSprite, currentKeeper)
        ) {
            states = "over";
            return;
        }
    }

    // Update spit and check collisions
    for (var j = spit.length - 1; j >= 0; j--) {
        var bullet = spit[j];

        bullet.y -= bullet.speed;

        // Remove spit that leaves the screen
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

                // Hide civilian for five seconds
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

                    // Hide zookeeper for five seconds
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

    // Draw player
    drawSprite(alpacaSprite);

    // Display score and timer
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";

    ctx.fillText("Score: " + score, 20, 35);
    ctx.fillText("Time: " + Math.ceil(timeLeft), 20, 65);

    // Check winning score
    if (score >= winningScore) {
        states = "win";
    }
}

// Draw a button
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

// Game over screen
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

    var instruction =
        "Press ENTER or click below to play again";

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

// Winning screen
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

    var instruction =
        "Press ENTER or click below to play again";

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

// Draw characters and flip their images
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

// Get a custom hitbox when one is defined
function getHitbox(object) {
    return {
        x: object.x + (object.hitboxX || 0),
        y: object.y + (object.hitboxY || 0),
        width: object.hitboxWidth || object.width,
        height: object.hitboxHeight || object.height
    };
}

// Rectangle collision detection
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

// Switch game scenes
function switchScenes(nameOfScene) {
    states = nameOfScene;
}

// Random number helper
function rand(_low, _high) {
    return Math.random() * (_high - _low) + _low;
}

// Random direction helper
function randomNegOneAndOne() {
    return Math.random() > 0.5 ? 1 : -1;
}

// END PROGRAM

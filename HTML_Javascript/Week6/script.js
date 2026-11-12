const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var fps = 1000 / 60;
var timer = setInterval(game, fps);
var startPoint = { x: canvas.width / 2, y: canvas.height / 2 };
var moveDirection = { x: 1, y: 1 };
var boxColor = "red";
var shipSprite = {
    image: document.getElementById("ship"),
    x: 1,
    y: 1,
    moveX: 0,
    moveY: 0
};
var acceleration = 0.5;
var friction = 0.9;
var score = 0;
var targetsShot = 0;

var states = ["title","game"];
states = "title";



// Box respawn variables
var boxActive = true;
function createStar() {
    var star = {
        x: 0,
        y: 0,
        radius: 0,
        color: "black",
        drawCircle: function () {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        },
    };
    return star;
}
// Create stars
var starCount = 50;
var stars = [];
for (var i = 0; i < starCount; i++) {
    stars[i] = createStar();
    stars[i].x = Math.random() * canvas.width;
    stars[i].y = Math.random() * canvas.height;
    stars[i].radius = Math.random() * 5;
    stars[i].color = "white";
}
shipSprite.x = canvas.width / 2;
shipSprite.y = canvas.height / 2 + 100;
var a = false;
var d = false;
var w = false;
var s = false;
var space = false;
var enter = false;
// Bullets
var bullets = [];
var shootCooldown = 0;
var startCooldown = 10;


// Shooting sound effect while firing 

var audioContext;
function playShootSound() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
        600, audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
        100, audioContext.currentTime + 0.15
    );
    gain.gain.setValueAtTime(
        0.2, audioContext.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
        0.01, audioContext.currentTime + 0.15
    );
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
}

//on key pressed
document.addEventListener("keydown", function(e){
    console.log(e.key);
    if(e.key == "a"){
        a = true;
    }
    if(e.key == "d"){
        d = true;
    }
    if(e.key == "w"){
        w = true;
    }
    if(e.key == "s"){
        s = true;
    }
    if(e.code === "Space"){
        space = true;
        e.preventDefault();
    }
    if(e.key =="Enter"){
        enter = true;
    }
});
//on key released
document.addEventListener("keyup", function(e){
    console.log(e.key);
    if(e.key == "a"){
        a = false;
    }
    if(e.key == "d"){
        d = false;
    }
    if(e.key == "w"){
        w = false;
    }
    if(e.key == "s"){
        s = false;
    }
    if(e.code === "Space"){
        space = false;
        e.preventDefault();
    }
    if(e.key =="Enter"){
        enter = false;
        
    }
});

//event for buttonclick
canvas.addEventListener("click", function(e){
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * canvas.width/ rect.width;
    const mouseY = (e.clientY - rect.top) * canvas.height/ rect.height;
    console.log(mouseX, mouseY)
    if(states ! = "game" &&
        mouseX >= canvas.width/2 - 100 &&
        mouseX <= canvas.width/2 + 100 &&
        mouseY >= canvas.height/2 + 100 &&
        mouseY <= canvas.height/2 + 100 
    ){
        startCooldown = 100;
        switchScenes("game");
    }
});

// Game loop
function game() {
 // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch(states){
        case "title":
            ctx.fillStyle = "black";
            ctx.font = "24px Arial";
            let titleText = "Star Shooter";
            ctx.fillText(titleText, canvas.width/2 - (ctx.measureText(titleText).width/2), canvas.height/2 -20);
            ctx.font = "16px Arial";
            let instructionText = "(press enter to start)";
            ctx.fillText(instructionText, canvas.width/2 - (ctx.measureText(instructionText).width/2), canvas.height/2 + 140);

            if(enter){
                startCooldown = 10;
                switchScenes("game");
    }
            

        break;

        case "game": 
            if(startCooldown > 0){
                 startCooldown -= 1;
                }
           


    // Move box only when active
    if (boxActive) {
        startPoint.x += moveDirection.x;
        startPoint.y += moveDirection.y;
    }
    var hitBox = shipSprite.x < startPoint.x + 25 &&
        shipSprite.x + 25 > startPoint.x &&
        shipSprite.y < startPoint.y + 25 &&
        shipSprite.y + 25 > startPoint.y;

    // Colliding with random box
    if (boxActive && hitBox == true) {
        shipSprite.x = canvas.width / 2;
        shipSprite.y = canvas.height / 2 + 100;
        shipSprite.moveX = 0;
        shipSprite.moveY = 0;
        score = 0;
    }
    // Ship movement
    if (a == true) {
        shipSprite.moveX -= acceleration;
    }
    if (d == true) {
        shipSprite.moveX += acceleration;
    }
    if (w == true) {
        shipSprite.moveY -= acceleration;
    }
    if (s == true) {
        shipSprite.moveY += acceleration;
    }
    // Screen wrapping
    if (shipSprite.x > canvas.width) {
        shipSprite.x = -25;
    }
    if (shipSprite.x < -25) {
        shipSprite.x = canvas.width;
    }

    // Box bouncing
    if (boxActive) {
        if (startPoint.y > canvas.height - 25 || startPoint.y < 0) {
            moveDirection.y = -1;
            boxColor = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        }
        if (startPoint.x > canvas.width - 25 || startPoint.x < 0) {
            moveDirection.x = -1;
            boxColor = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        }
    }
    // Multiply by friction
    shipSprite.moveX = friction;
    shipSprite.moveY = friction;

    // Update ship position
    shipSprite.x += shipSprite.moveX;
    shipSprite.y += shipSprite.moveY;
    // Bullet firing
    if (shootCooldown > 0) {
        shootCooldown--;
    }
    if (space && shootCooldown === 0) {
        bullets.push({
            x: shipSprite.x + 25 / 2 - 2,
            y: shipSprite.y - 10,
            width: 4,
            height: 10,
            speed: 8,
            color: "white"
        });
        // Play shooting sound
        playShootSound();
        shootCooldown = 10;
    }
    // Draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw stars
    for (var i = 0; i < stars.length; i++) {
        // Collision with star
        if (shipToStarCollision(shipSprite, stars[i])) {
            shipSprite.x = canvas.width / 2;
            shipSprite.y = canvas.height / 2 + 100;
            shipSprite.moveX = 0;
            shipSprite.moveY = 0;
            score = 0;
        }
        stars[i].drawCircle();
        stars[i].y++;
        if (stars[i].y > canvas.height + stars[i].radius * 2) {
            stars[i].x = Math.random() * canvas.width;
            stars[i].y = -(Math.random() * canvas.height);
            score += 10;
        }
    }
    // Draw and check bullet collision
    for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        bullet.y -= bullet.speed;
        // Remove bullets that leave screen
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
            continue;
        }
        // Check bullet collision with box
        var hitBox = bullet.x < startPoint.x + 25 &&
            bullet.x + bullet.width > startPoint.x &&
            bullet.y < startPoint.y + 25 &&
            bullet.y + bullet.height > startPoint.y;
        if (hitBox && boxActive) {
            // Remove bullet

            bullets.splice(i, 1);
            

            // Increase targets shot counter
            targetsShot++;

            // Make box disappear

            boxActive = false;

            // Respawn box after 3 seconds

            setTimeout(function () {
                startPoint.x = Math.random() * (canvas.width - 25);
                startPoint.y = Math.random() * (canvas.height - 25);
                moveDirection.x = 1;
                moveDirection.y = 1;
                boxColor = "red";
                boxActive = true;
            }, 3000);
            continue;
        }
        // Bullet collision with stars
        for (var j = 0; j < stars.length; j++) {
            if (shipToStarCollision(bullet, stars[j])) {
                bullets.splice(i, 1);
                stars[j].x = Math.random() * canvas.width;
                stars[j].y = -(Math.random() * canvas.height);
                break;
            }
        }
        // Draw bullet
        ctx.fillStyle = bullet.color;
        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    }
    // Draw box only when active
    if (boxActive) {
        ctx.fillStyle = boxColor;
        ctx.fillRect(
            startPoint.x,
            startPoint.y,
            25,
            25
        );
    }
    // Draw ship
    ctx.drawImage(
        shipSprite.image,
        shipSprite.x,
        shipSprite.y,
        25,
        25
    );
    // HUD ELEMENTS


    // Score on left
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
        `Score: ${score}`,
        30,
        80
    );
    // Targets shot on right
    ctx.textAlign = "right";
    ctx.fillText(
        `Targets Shot: ${targetsShot}`,
        canvas.width - 30,
        80
    );
    
    break;
}
 
}
   
// Ship to star collision
function shipToStarCollision(obj, star) {
    var closestX = Math.max(
        obj.x,
        Math.min(star.x, obj.x + 25)
    );
    var closestY = Math.max(
        obj.y,
        Math.min(star.y, obj.y + 25)
    );
    var dx = star.x - closestX;
    var dy = star.y - closestY;

    var dist = dx * dx + dy * dy;
    return dist <= star.radius * star.radius;
}

function switchScenes(nameOfScene){
    states = nameOfScene;
}
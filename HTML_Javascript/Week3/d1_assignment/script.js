const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

// Square
ctx.beginPath();
ctx.rect(85, 302, 100, 100);
ctx.fillStyle = "#ffff00";
ctx.fill();
ctx.strokeStyle = "#000000";
ctx.lineWidth = 5;
ctx.stroke();

// Circle
ctx.beginPath();
ctx.arc(385, 441, 66, 0, Math.PI * 2);
ctx.fillStyle = "#ffff00";
ctx.fill();
ctx.strokeStyle = "red";
ctx.lineWidth = 5;
ctx.stroke();

// Pentagon
ctx.beginPath();
ctx.moveTo(558, 309);
ctx.lineTo(667, 285);
ctx.lineTo(725, 381);
ctx.lineTo(651, 465);
ctx.lineTo(548, 421);
ctx.closePath();
ctx.fillStyle = "#ff00ff";
ctx.fill();
ctx.strokeStyle = "#00ffff";
ctx.lineWidth = 5;
ctx.stroke();

// Line
ctx.beginPath();
ctx.moveTo(85, 683);
ctx.lineTo(279, 549);
ctx.strokeStyle = "rgb(255, 0, 0)";
ctx.lineWidth = 5;
ctx.stroke();

// Star
ctx.beginPath();
ctx.moveTo(636, 497);
ctx.lineTo(668, 555);
ctx.lineTo(734, 567);
ctx.lineTo(688, 615);
ctx.lineTo(697, 682);
ctx.lineTo(636, 653);
ctx.lineTo(575, 682);
ctx.lineTo(584, 615);
ctx.lineTo(538, 567);
ctx.lineTo(604, 555);
ctx.closePath();
ctx.fillStyle = "#ffff00";
ctx.fill();
ctx.strokeStyle = "rgb(32, 32, 32)";
ctx.lineWidth = 5;
ctx.stroke();
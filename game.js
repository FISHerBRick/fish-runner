const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gravity = 0.8;
let cameraX = 0;

const player = {
  x: 100,
  y: 300,
  w: 40,
  h: 40,
  dy: 0,
  grounded: false,
  punching: false,
};

let keys = {};

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function updatePlayer() {
  // Jump
  if (keys["Space"] && player.grounded) {
    player.dy = -14;
    player.grounded = false;
  }

  // Gravity
  player.dy += gravity;
  player.y += player.dy;

  // Ground collision
  if (player.y + player.h >= canvas.height - 50) {
    player.y = canvas.height - 50 - player.h;
    player.dy = 0;
    player.grounded = true;
  }

  // Punch
  if (keys["KeyF"]) {
    player.punching = true;
  } else {
    player.punching = false;
  }
}

function drawPlayer() {
  ctx.fillStyle = player.punching ? "orange" : "cyan";
  ctx.fillRect(player.x - cameraX, player.y, player.w, player.h);
}

let groundOffset = 0;
let groundSpeed = 6;

function drawGround() {
  ctx.fillStyle = "#555";
  groundOffset -= groundSpeed;
  if (groundOffset <= -canvas.width) groundOffset = 0;
  ctx.fillRect(groundOffset, canvas.height - 50, canvas.width * 2, 50);
}

let obstacles = [];
let enemies = [];
let spawnTimer = 0;

function spawnEntities() {
  spawnTimer--;
  if (spawnTimer <= 0) {
    if (Math.random() < 0.5) {
      obstacles.push({ x: cameraX + canvas.width + 50, y: 310, w: 40, h: 40 });
    } else {
      enemies.push({ x: cameraX + canvas.width + 50, y: 310, w: 40, h: 40, alive: true });
    }
    spawnTimer = 100 + Math.random() * 100;
  }
}

function updateEntities() {
  obstacles.forEach(o => o.x -= groundSpeed);
  enemies.forEach(e => e.x -= groundSpeed);
  obstacles = obstacles.filter(o => o.x + o.w > cameraX);
  enemies = enemies.filter(e => e.x + e.w > cameraX && e.alive);
}

function drawEntities() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => ctx.fillRect(o.x - cameraX, o.y, o.w, o.h));
  ctx.fillStyle = "lime";
  enemies.forEach(e => ctx.fillRect(e.x - cameraX, e.y, e.w, e.h));
}

function checkCollisions() {
  // Hitting obstacles
  obstacles.forEach(o => {
    if (player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y) {
      console.log("Hit obstacle!");
    }
  });

  // Punching enemies
  enemies.forEach(e => {
    if (player.punching &&
        player.x + player.w > e.x &&
        player.x < e.x + e.w &&
        player.y + player.h > e.y &&
        player.y < e.y + e.h) {
      e.alive = false;
    }
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cameraX += groundSpeed;

  updatePlayer();
  spawnEntities();
  updateEntities();
  checkCollisions();

  drawGround();
  drawEntities();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

gameLoop();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Game variables
let gravity = 0.6;
let gameSpeed = 5;
let score = 0;
let groundX = 0;
let spawnTimer = 0;
let obstacles = [];
let gameOver = false;

// Dino
const dino = {
  x: 50,
  y: 150,
  width: 40,
  height: 40,
  dy: 0,
  jumpForce: -10,
  grounded: true,

  jump() {
    if (this.grounded && !gameOver) {
      this.dy = this.jumpForce;
      this.grounded = false;
    }
  },

  update() {
    this.dy += gravity;
    this.y += this.dy;
    if (this.y > 150) {
      this.y = 150;
      this.dy = 0;
      this.grounded = true;
    }
  },

  draw() {
    ctx.fillStyle = "#555";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// Spawn cactus
function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 160,
    width: 20 + Math.random() * 20,
    height: 40
  });
}

function updateObstacles() {
  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = 100 + Math.random() * 100;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= gameSpeed;

    // Collision detection
    if (
      dino.x < obs.x + obs.width &&
      dino.x + dino.width > obs.x &&
      dino.y < obs.y + obs.height &&
      dino.y + dino.height > obs.y
    ) {
      gameOver = true;
    }

    // Remove off-screen obstacles
    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }
}

function drawObstacles() {
  ctx.fillStyle = "#228B22";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

// Draw ground
function drawGround() {
  groundX -= gameSpeed;
  if (groundX <= -canvas.width) groundX = 0;
  ctx.fillStyle = "#888";
  ctx.fillRect(groundX, 190, canvas.width * 2, 10);
}

// Draw score
function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);
}

// Reset game
function resetGame() {
  obstacles = [];
  gameSpeed = 5;
  score = 0;
  gameOver = false;
  dino.y = 150;
  dino.dy = 0;
  loop();
}

// Game loop
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  dino.update();
  updateObstacles();
  dino.draw();
  drawObstacles();
  drawScore();

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 120, 100);

    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2 - 90, 130);
    return;
  }

  // Increase difficulty and score
  score += 0.1;
  gameSpeed += 0.002;

  requestAnimationFrame(loop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") dino.jump();
  if (e.code === "KeyR" && gameOver) resetGame();
});

// Start
loop();

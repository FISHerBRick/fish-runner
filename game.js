const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Sprites ---
const walkNames = [
  "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png"
];

const walkFrames = walkNames.map(name => {
  const img = new Image();
  img.src = `https://raw.githubusercontent.com/FISHerBRick/fish-runner/main/${name}`;
  return img;
});

const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/FISHerBRick/fish-runner/main/WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png";

// --- Player ---
const player = {
  x: 50,
  y: canvas.height - 60, // ground level
  width: 60,
  height: 60,
  dy: 0,
  jumpForce: -12,
  grounded: true
};

// --- Game variables ---
let gravity = 0.6;
let gameSpeed = 6;
let obstacles = [];
let spawnTimer = 0;
let score = 0;
let gameOver = false;
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 8;

// --- Controls ---
document.addEventListener("keydown", e => {
  if (e.code === "Space" && player.grounded && !gameOver) {
    player.dy = player.jumpForce;
    player.grounded = false;
  }
  if (e.code === "KeyR" && gameOver) resetGame();
});

// --- Reset game ---
function resetGame() {
  obstacles = [];
  player.y = canvas.height - player.height;
  player.dy = 0;
  player.grounded = true;
  gameSpeed = 6;
  score = 0;
  gameOver = false;
  loop();
}

// --- Spawn obstacles ---
function spawnObstacle() {
  const height = 40;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - height,
    width: 20 + Math.random() * 20,
    height: height
  });
}

// --- Update obstacles ---
function updateObstacles() {
  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = 90 + Math.random() * 60;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;

    // Collision
    if (
      player.x < obstacles[i].x + obstacles[i].width &&
      player.x + player.width > obstacles[i].x &&
      player.y < obstacles[i].y + obstacles[i].height &&
      player.y + player.height > obstacles[i].y
    ) {
      gameOver = true;
    }

    if (obstacles[i].x + obstacles[i].width < 0) obstacles.splice(i, 1);
  }
}

// --- Main loop ---
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Ground ---
  ctx.fillStyle = "#888";
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  // --- Player physics ---
  player.dy += gravity;
  player.y += player.dy;
  if (player.y >= canvas.height - player.height - 10) {
    player.y = canvas.height - player.height - 10;
    player.dy = 0;
    player.grounded = true;
  }

  // --- Animate ---
  if (player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
      frameCount = 0;
    }
  }

  // --- Draw player ---
  const sprite = player.grounded ? walkFrames[currentFrame] : jumpFrame;
  ctx.drawImage(sprite, player.x, player.y, player.width, player.height);

  // --- Obstacles ---
  updateObstacles();
  ctx.fillStyle = "#228B22";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // --- Score ---
  score += 0.1;
  gameSpeed += 0.002;
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);

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

  requestAnimationFrame(loop);
}

// --- Start game after images loaded ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + 1) resetGame();
  };
});

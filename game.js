const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ------------------------------------------------------------
// ----------------------- FISH SPRITES ------------------------
// ------------------------------------------------------------
const walkFrames = [
  "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png"
].map(name => {
  const img = new Image();
  img.src = name;
  return img;
});

const jumpFrame = new Image();
jumpFrame.src = "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png";

// ------------------------------------------------------------
// ----------------------- ENEMY (CRAB) ------------------------
// ------------------------------------------------------------
const enemyFrames = [
  "WhatsApp_Image_2025-11-15_at_18.26.39_87b049ea-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.32_094df33f-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.17_8b544d03-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.11_a228a4d3-removebg-preview.png"
].map(name => {
  const img = new Image();
  img.src = name;
  return img;
});

// Array to hold multiple enemies
let enemies = [];

// Spawn enemy at random intervals
function spawnEnemy() {
  const height = 40;
  enemies.push({
    x: canvas.width + Math.random() * 300, // random spawn off-screen
    y: groundY - height,
    width: 60,
    height: height,
    speed: 5 + Math.random() * 2, // slightly different speeds
    frame: 0,
    frameCounter: 0
  });
}

// ------------------------------------------------------------
// ----------------------- BACKGROUND --------------------------
// ------------------------------------------------------------
const background = new Image();
background.src = "bbackground.jpeg";

let bgX = 0;
let bgSpeed = 0;

// ------------------------------------------------------------
// --------------------- ANIMATION DATA ------------------------
// ------------------------------------------------------------
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 8;

let gravity = 0.6;
let gameSpeed = 5;
let score = 0;
let groundY = canvas.height - 50;

let gameOver = false;

// ------------------------------------------------------------
// ----------------------- PLAYER (FISH) -----------------------
// ------------------------------------------------------------
const fish = {
  x: 50,
  y: groundY - 60,
  width: 60,
  height: 60,
  dy: 0,
  jumpForce: -12,
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

    if (this.y > groundY - this.height) {
      this.y = groundY - this.height;
      this.dy = 0;
      this.grounded = true;
    }
  },

  draw() {
    const sprite = this.grounded ? walkFrames[currentFrame] : jumpFrame;
    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
  }
};

// ------------------------------------------------------------
// ----------------------- ENEMY FUNCTIONS ---------------------
// ------------------------------------------------------------
function updateEnemies() {
  // Spawn enemies with minimum spacing
  if (Math.random() < 0.02) {
  const last = enemies[enemies.length - 1];
  
  // Only spawn if there is enough space from the last crab
  if (!last || last.x < canvas.width - 200) {
    spawnEnemy();
  }
}

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= e.speed;

    // Animate enemy
    e.frameCounter++;
    if (e.frameCounter >= 10) {
      e.frame = (e.frame + 1) % enemyFrames.length;
      e.frameCounter = 0;
    }

    ctx.drawImage(enemyFrames[e.frame], e.x, e.y, e.width, e.height);

    // Collision with fish
    if (
      fish.x < e.x + e.width &&
      fish.x + fish.width > e.x &&
      fish.y < e.y + e.height &&
      fish.y + fish.height > e.y
    ) {
      gameOver = true;
    }

    // Remove off-screen enemies
    if (e.x + e.width < 0) enemies.splice(i, 1);
  }
}

// ------------------------------------------------------------
// -------------------------- GROUND ---------------------------
// ------------------------------------------------------------
function drawGround() {
  ctx.fillStyle = "#FFDF8A";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

// ------------------------------------------------------------
// --------------------------- SCORE ---------------------------
// ------------------------------------------------------------
function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);
}

// ------------------------------------------------------------
// --------------------------- RESET ---------------------------
// ------------------------------------------------------------
function resetGame() {
  gameSpeed = 5;
  score = 0;
  gameOver = false;
  fish.y = groundY - fish.height;
  fish.dy = 0;
  enemies = [];
  loop();
}

// ------------------------------------------------------------
// --------------------------- LOOP ----------------------------
// ------------------------------------------------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background scroll
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);

  drawGround();
  fish.update();
  fish.draw();

  updateEnemies();

  drawScore();

  // Animate fish
  if (fish.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
      frameCount = 0;
    }
  } else {
    currentFrame = 2;
  }

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

  score += 0.1;
  gameSpeed += 0.002;

  bgSpeed = gameSpeed * 0.5;

  requestAnimationFrame(loop);
}

// ------------------------------------------------------------
// ------------------------- CONTROLS --------------------------
// ------------------------------------------------------------
document.addEventListener("keydown", e => {
  if (e.code === "Space") fish.jump();
  if (e.code === "KeyR" && gameOver) resetGame();
});

// ------------------------------------------------------------
// ---------------------- START GAME ---------------------------
// ------------------------------------------------------------
let imagesLoaded = 0;
[...walkFrames, jumpFrame, ...enemyFrames].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + enemyFrames.length + 1) {
      loop();
    }
  };
});




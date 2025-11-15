const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Fish walk sprites ---
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

// --- Background ---
const background = new Image();
background.src = "bbackground.jpeg";

// Scrolling background
let bgX = 0;
let bgSpeed = 0;

// --- Animation ---
let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 8;

// --- Game values ---
let gravity = 0.6;
let gameSpeed = 5;
let score = 0;
let groundY = canvas.height - 50;
let gameOver = false;

// ------------------------------------------------------------
// ---------------------- CRAB ENEMY ---------------------------
// ------------------------------------------------------------
let enemyX = canvas.width;
let enemyY = groundY - 40;
let enemyWidth = 50;
let enemyHeight = 40;
let enemySpeed = 5;

// Crab animation frames
const enemyFrames = [
  "WhatsApp Image 2025-11-15 at 18.26.39_87b049ea.jpg",
  "WhatsApp Image 2025-11-15 at 18.26.32_094df33f.jpg",
  "WhatsApp Image 2025-11-15 at 18.26.17_8b544d03.jpg",
  "WhatsApp Image 2025-11-15 at 18.26.11_a228a4d3.jpg"
].map(name => {
  const img = new Image();
  img.src = name;
  return img;
});

let enemyFrame = 0;
let enemyFrameCounter = 0;
let enemyFrameDelay = 10;

// ------------------------------------------------------------
// ------------------------- FISH ------------------------------
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

    // Landing
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
// -------------------- ENEMY UPDATE ---------------------------
// ------------------------------------------------------------
function updateEnemy() {

  // Movement
  enemyX -= enemySpeed;

  // Reset when off screen
  if (enemyX + enemyWidth < 0) {
    enemyX = canvas.width + Math.random() * 300;
  }

  // Animation
  enemyFrameCounter++;
  if (enemyFrameCounter >= enemyFrameDelay) {
    enemyFrame = (enemyFrame + 1) % enemyFrames.length;
    enemyFrameCounter = 0;
  }

  // Draw enemy
  ctx.drawImage(enemyFrames[enemyFrame], enemyX, enemyY, enemyWidth, enemyHeight);

  // Collision
  if (
    fish.x < enemyX + enemyWidth &&
    fish.x + fish.width > enemyX &&
    fish.y < enemyY + enemyHeight &&
    fish.y + fish.height > enemyY
  ) {
    gameOver = true;
  }
}

// ------------------------------------------------------------
// ------------------------ GROUND -----------------------------
// ------------------------------------------------------------
function drawGround() {
  ctx.fillStyle = "#FFDF8A";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

// ------------------------------------------------------------
// -------------------------- SCORE -----------------------------
// ------------------------------------------------------------
function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);
}

// ------------------------------------------------------------
// ------------------------- RESET ------------------------------
// ------------------------------------------------------------
function resetGame() {
  gameOver = false;
  score = 0;
  gameSpeed = 5;

  fish.y = groundY - fish.height;
  fish.dy = 0;

  enemyX = canvas.width;

  loop();
}

// ------------------------------------------------------------
// ----------------------- MAIN LOOP ---------------------------
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
  updateEnemy();
  drawScore();

  // Running animation
  if (fish.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
      frameCount = 0;
    }
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width/2 - 120, 100);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvas.width/2 - 90, 130);
    return;
  }

  // Speed increase + scoring
  score += 0.1;
  gameSpeed += 0.002;
  enemySpeed = gameSpeed;

  bgSpeed = gameSpeed * 0.5;

  requestAnimationFrame(loop);
}

// ------------------------------------------------------------
// ------------------------ CONTROLS ----------------------------
// ------------------------------------------------------------
document.addEventListener("keydown", e => {
  if (e.code === "Space") fish.jump();
  if (e.code === "KeyR" && gameOver) resetGame();
});

// ------------------------------------------------------------
// ------------------------- START ------------------------------
// ------------------------------------------------------------
let imagesLoaded = 0;
[...walkFrames, jumpFrame, ...enemyFrames].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + 1 + enemyFrames.length) {
      loop();
    }
  };
});


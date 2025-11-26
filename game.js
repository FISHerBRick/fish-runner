const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ------------------------------------------------------------
// ----------------------- FISH WALK SPRITES -------------------
// ------------------------------------------------------------
const walkFrames = [
  "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png"
].map(src => { const img = new Image(); img.src = src; return img; });

// Jump sprite
const jumpFrame = new Image();
jumpFrame.src = "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png";

// ------------------------------------------------------------
// ----------------------- FISH PUNCH SPRITES ------------------
// ------------------------------------------------------------
const punchFrames = [
  "WhatsApp_Image_2025-11-21_at_19.08.00_698d1fe7-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_19.08.07_fbc3e0cf-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_19.08.15_a15ae3db-removebg-preview.png"
].map(src => { const img = new Image(); img.src = src; return img; });

// ------------------------------------------------------------
// ----------------------- CRAB ENEMY --------------------------
// ------------------------------------------------------------
const enemyFrames = [
  "WhatsApp_Image_2025-11-15_at_18.26.39_87b049ea-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.32_094df33f-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.17_8b544d03-removebg-preview.png",
  "WhatsApp_Image_2025-11-15_at_18.26.11_a228a4d3-removebg-preview.png"
].map(src => { const img = new Image(); img.src = src; return img; });

let enemies = [];
let enemyCooldown = 0;

// ------------------------------------------------------------
// --------------------- PUFFERFISH ENEMY ----------------------
// ------------------------------------------------------------
const pufferFrames = [
  "WhatsApp_Image_2025-11-21_at_16.43.14_55cd5749-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_16.43.05_1eb00eac-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_16.42.38_22498641-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_16.42.23_aca60190-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_16.42.17_997a2bb4-removebg-preview.png",
  "WhatsApp_Image_2025-11-21_at_16.42.17_3e25ce04-removebg-preview.png"
].map(src => { const img = new Image(); img.src = src; return img; });

let puffers = [];
let particles = [];

// ------------------------------------------------------------
// ------------------------- PARTICLES -------------------------
// ------------------------------------------------------------
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.dx = (Math.random() - 0.5) * 4;
    this.dy = (Math.random() - 1.5) * 4;
    this.size = 4 + Math.random() * 3;
    this.life = 30 + Math.random() * 20;
    this.color = color;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life--;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// ------------------------------------------------------------
// ------------------------- BACKGROUND ------------------------
// ------------------------------------------------------------
const background = new Image();
background.src = "bbackground.jpeg";

let bgX = 0;
let bgSpeed = 0;

// ------------------------------------------------------------
// ----------------------- ANIMATION DATA ----------------------
// ------------------------------------------------------------
let currentFrame = 0;
let frameCount = 0;
let frameSpeed = 8;

let gravity = 0.6;
let baseSpeed = 5;
let gameSpeed = baseSpeed;
let score = 0;
let groundY = canvas.height - 50;
let gameOver = false;

// ------------------------------------------------------------
// ----------------------- PLAYER OBJECT -----------------------
// ------------------------------------------------------------
const fish = {
  x: 50,
  y: groundY - 60,
  width: 60,
  height: 60,
  dy: 0,
  grounded: true,
  jumpForce: -12,
  punching: false,
  punchFrame: 0,
  punchFrameCounter: 0,
  punchFrameSpeed: 6,
  punchRange: 40,

  jump() {
    if (this.grounded && !gameOver) {
      this.dy = this.jumpForce;
      this.grounded = false;
    }
  },

  punch() {
    if (!gameOver && !this.punching) {
      this.punching = true;
      this.punchFrame = 0;
      this.punchFrameCounter = 0;
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

    if (this.punching) {
      this.punchFrameCounter++;
      if (this.punchFrameCounter >= this.punchFrameSpeed) {
        this.punchFrameCounter = 0;
        this.punchFrame++;
        if (this.punchFrame >= punchFrames.length) {
          this.punching = false;
          this.punchFrame = 0;
        }
      }
    }
  },

  draw() {
    let sprite;
    if (this.punching) sprite = punchFrames[this.punchFrame];
    else if (!this.grounded) sprite = jumpFrame;
    else sprite = walkFrames[currentFrame];

    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
  }
};

// ------------------------------------------------------------
// ----------------------- ENEMY SPAWN -------------------------
// ------------------------------------------------------------
function spawnEnemy() {
  if (enemyCooldown <= 0) {
    enemies.push({
      x: canvas.width + Math.random() * 200,
      y: groundY - 40, // ensure crab is on the ground
      width: 60,
      height: 40,
      speed: gameSpeed,
      frame: 0,
      frameCounter: 0
    });
    enemyCooldown = 150;
  }
}

// ------------------------------------------------------------
// ----------------------- ENEMY UPDATE ------------------------
// ------------------------------------------------------------
function updateEnemies() {
  enemyCooldown--;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= e.speed;

    e.frameCounter++;
    if (e.frameCounter >= 10) {
      e.frame = (e.frame + 1) % enemyFrames.length;
      e.frameCounter = 0;
    }

    ctx.drawImage(enemyFrames[e.frame], e.x, e.y, e.width, e.height);

    if (
      fish.x < e.x + e.width &&
      fish.x + fish.width > e.x &&
      fish.y < e.y + e.height &&
      fish.y + fish.height > e.y
    ) {
      gameOver = true;
    }

    if (e.x + e.width < 0) enemies.splice(i, 1);
  }
}

// ------------------------------------------------------------
// --------------------- PUFFERFISH UPDATE ---------------------
// ------------------------------------------------------------
function spawnPuffer() {
  puffers.push({
    x: canvas.width + 50,
    y: 100 + Math.random() * 200,
    width: 50,
    height: 50,
    speed: 4 + Math.random() * 2,
    frame: 0,
    frameCounter: 0,
    alive: true
  });
}

function updatePuffers() {
  if (Math.random() < 0.005) spawnPuffer();

  for (let i = puffers.length - 1; i >= 0; i--) {
    const p = puffers[i];
    p.x -= p.speed;

    p.frameCounter++;
    if (p.frameCounter >= 10) {
      p.frame = (p.frame + 1) % pufferFrames.length;
      p.frameCounter = 0;
    }

    if (p.alive) ctx.drawImage(pufferFrames[p.frame], p.x, p.y, p.width, p.height);

    if (
      p.alive &&
      fish.x < p.x + p.width &&
      fish.x + fish.width > p.x &&
      fish.y < p.y + p.height &&
      fish.y + fish.height > p.y
    ) {
      gameOver = true;
    }

    if (
      fish.punching &&
      p.alive &&
      fish.x + fish.width + fish.punchRange > p.x &&
      fish.y < p.y + p.height &&
      fish.y + fish.height > p.y
    ) {
      p.alive = false;
      for (let j = 0; j < 15; j++) particles.push(new Particle(p.x + 25, p.y + 25, "#FFD700"));
    }

    if (p.x + p.width < 0) puffers.splice(i, 1);
  }
}

// ------------------------------------------------------------
// --------------------------- GROUND --------------------------
// ------------------------------------------------------------
function drawGround() {
  ctx.fillStyle = "#FFDF8A";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

// ------------------------------------------------------------
// ---------------------------- SCORE --------------------------
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
  enemies = [];
  puffers = [];
  particles = [];
  score = 0;
  gameOver = false;
  fish.y = groundY - fish.height;
  fish.dy = 0;
  gameSpeed = baseSpeed;
  bgSpeed = 0;
  enemyCooldown = 0;
  loop();
}

// ------------------------------------------------------------
// --------------------------- LOOP ----------------------------
// ------------------------------------------------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background scroll
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);

  drawGround();

  fish.update();
  fish.draw();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.life <= 0) particles.splice(i, 1);
  }

  updateEnemies();
  updatePuffers();
  drawScore();

  if (fish.grounded && !fish.punching) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
      frameCount = 0;
    }
  }

  if (!gameOver) {
    score += 0.1;
    gameSpeed += 0.002;
    bgSpeed = gameSpeed * 0.5;
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 120, 100);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2 - 90, 130);
  }

  requestAnimationFrame(loop);
}

// ------------------------------------------------------------
// --------------------------- CONTROLS ------------------------
// ------------------------------------------------------------
document.addEventListener("keydown", e => {
  if (e.code === "Space") fish.jump();
  if (e.code === "KeyR" && gameOver) resetGame();
  if (e.code === "KeyE") fish.punch();
});

// ------------------------------------------------------------
// ------------------------ IMAGE LOADING -----------------------
// ------------------------------------------------------------
let images = [...walkFrames, ...punchFrames, ...enemyFrames, ...pufferFrames, jumpFrame];
let imagesLoaded = 0;
let loopStarted = false;

images.forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === images.length) startGame();
  };
  img.onerror = () => {
    console.warn("Failed to load image:", img.src);
    imagesLoaded++;
    if (imagesLoaded === images.length) startGame();
  };
});

setTimeout(() => {
  if (!loopStarted) startGame();
}, 2000);

function startGame() {
  if (!loopStarted) {
    loopStarted = true;
    loop();
  }
}

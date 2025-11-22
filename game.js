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
].map(name => {
  const img = new Image();
  img.src = name;
  return img;
});

let puffers = [];

let particles = [];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.dx = (Math.random() - 0.5) * 4; // horizontal speed
    this.dy = (Math.random() - 1.5) * 4; // vertical speed
    this.size = 4 + Math.random() * 3;   // size of the square
    this.life = 30 + Math.random() * 20; // frames to live
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
  punching: false,       // is the fish currently punching
  punchDuration: 10,     // how many frames the punch lasts
  punchFrameCount: 0,    // counter for punch frames
  punchRange: 40,        // distance in front of fish that counts as a punch
  punch() {
  if (!gameOver) {
    this.punching = true;
    this.punchFrameCount = 0;
  }
},
  
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
function spawnEnemy() {
  const height = 40;
  enemies.push({
    x: canvas.width + Math.random() * 300,
    y: groundY - height,
    width: 60,
    height: height,
    speed: 5 + Math.random() * 2,
    frame: 0,
    frameCounter: 0
  });
}

function updateEnemies() {
  if (Math.random() < 0.02) {
    const last = enemies[enemies.length - 1];
    if (!last || last.x < canvas.width - 200) {
      spawnEnemy();
    }
  }

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
// ------------------- UPDATE PUFFERFISH -----------------------
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

    if (p.alive) {
      ctx.drawImage(pufferFrames[p.frame], p.x, p.y, p.width, p.height);
    }

    if (
      p.alive &&
      fish.x < p.x + p.width &&
      fish.x + fish.width > p.x &&
      fish.y < p.y + p.height &&
      fish.y + fish.height > p.y
    ) {
      gameOver = true;
    }

    if (p.x + p.width < 0) puffers.splice(i, 1);
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
  puffers = [];
  loop();
}

// ------------------------------------------------------------
// --------------------------- LOOP ----------------------------
// ------------------------------------------------------------
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bgX -= bgSpeed;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);

  drawGround();
  fish.update();
  fish.draw();

  // Handle punch timing
if (fish.punching) {
  fish.punchFrameCount++;
  if (fish.punchFrameCount >= fish.punchDuration) {
    fish.punching = false;
  }
}

  // Update and draw particles
for (let i = particles.length - 1; i >= 0; i--) {
  const particle = particles[i];
  particle.update();
  particle.draw();
  if (particle.life <= 0) particles.splice(i, 1);
}

  // Check collision with puffers
if (fish.punching) {
  puffers.forEach(p => {
  if (
    p.alive &&
    fish.x + fish.width + fish.punchRange > p.x &&
    fish.x < p.x + p.width &&
    fish.y + fish.height > p.y &&
    fish.y < p.y + p.height
  ) {
    p.alive = false; // Puffer dies

    // Spawn particles
    const pufferColor = "#FFD700"; // color of the pufferfish
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(p.x + p.width / 2, p.y + p.height / 2, pufferColor));
    }
  }
});
}

  updateEnemies();
  updatePuffers();

  drawScore();

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
  if (e.code === "KeyE") fish.punch();
});

// ------------------------------------------------------------
// ---------------------- START GAME ---------------------------
// ------------------------------------------------------------
let imagesLoaded = 0;
[...walkFrames, jumpFrame, ...enemyFrames, ...pufferFrames].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + enemyFrames.length + pufferFrames.length + 1) {
      loop();
    }
  };
});

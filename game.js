const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Sprites ---
const walkFrames = [new Image(), new Image(), new Image(), new Image(), new Image()];
walkFrames[0].src = "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png";
walkFrames[1].src = "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png";
walkFrames[2].src = "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png";
walkFrames[3].src = "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png";
walkFrames[4].src = "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png";

const jumpFrame = new Image();
jumpFrame.src = "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png"; // same jump sprite for now

// --- Player ---
const player = {
  x: 50,
  y: 0,
  width: 100,
  height: 100,
  dy: 0,
  grounded: false,
  facingRight: true
};

// --- Tunables ---
const PLAYER_SPEED = 6;
const GRAVITY = 0.7;
const JUMP_POWER = -10;
const WORLD_WIDTH = 2600;

// --- Enemy ---
let enemy = {
  spawnX: 600, x: 600, y: 320, w: 30, h: 30,
  dy: 0, speed: 1.2, gravity: 0.6, jumpPower: -8,
  grounded: false, triggered: false, patrolDir: 1
};

// --- Platforms ---
const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 700, y: 300, w: 100, h: 10 },
  { x: 900, y: 250, w: 100, h: 10 },
  { x: 1100, y: 200, w: 100, h: 10 },
  { x: 1300, y: 150, w: 100, h: 10 },
  { x: 1600, y: 250, w: 120, h: 10 },
  { x: 1800, y: 200, w: 100, h: 10 },
  { x: 2000, y: 350, w: 400, h: 30 }
];

// --- State ---
let keys = {};
let currentFrame = 0, frameCount = 0, frameSpeed = 10;
let cameraX = 0, score = 0, gameOver = false;

let jumpPressed = false;

// --- Input (WASD only) ---
document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (["w","a","s","d"].includes(k)) e.preventDefault();
  if (k === "w") {
    keys.up = true;
    if (!jumpPressed && player.grounded) {
      player.dy = JUMP_POWER;
      player.grounded = false;
      jumpPressed = true;
    }
  }
  if (k === "a") keys.left = true;
  if (k === "d") keys.right = true;
  if (k === "r") resetGame();
});

document.addEventListener("keyup", e => {
  const k = e.key.toLowerCase();
  if (k === "w") jumpPressed = false;
  if (k === "a") keys.left = false;
  if (k === "d") keys.right = false;
});

// --- Reset Game ---
function resetGame() {
  player.x = 50;
  player.y = platforms[0].y - player.height;
  player.dy = 0;
  player.grounded = true;
  player.facingRight = true;
  score = 0;
  gameOver = false;

  enemy.x = enemy.spawnX;
  enemy.y = 320;
  enemy.dy = 0;
  enemy.grounded = false;
  enemy.triggered = false;
}

// --- Main Update ---
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.fillText("GAME OVER! Press R to Restart", 150, 200);
    requestAnimationFrame(update);
    return;
  }

  let moving = false;

  // --- Movement ---
  if (keys.left) { 
    player.x -= PLAYER_SPEED; 
    player.facingRight = false; 
    moving = true; 
  }
  if (keys.right) { 
    player.x += PLAYER_SPEED; 
    player.facingRight = true; 
    moving = true; 
  }

  // --- Physics & Platform Collision ---
  player.dy += GRAVITY;
  let nextY = player.y + player.dy;
  let groundedThisFrame = false;

  for (const p of platforms) {
    const overlapsX = player.x + player.width > p.x && player.x < p.x + p.w;
    if (!overlapsX) continue;

    if (player.dy >= 0 && player.y + player.height <= p.y && nextY + player.height >= p.y) {
      nextY = p.y - player.height;
      player.dy = 0;
      groundedThisFrame = true;
    }
    if (player.dy < 0 && player.y >= p.y + p.h && nextY <= p.y + p.h) {
      nextY = p.y + p.h;
      player.dy = 0;
    }
  }

  if (nextY + player.height > canvas.height) {
    player.y = platforms[0].y - player.height;
    player.dy = 0;
    player.grounded = true;
  } else if (nextY < 0) {
    player.y = 0;
    player.dy = 0;
    player.grounded = false;
  } else {
    player.y = nextY;
    player.grounded = groundedThisFrame;
  }

  player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.width));

  // --- Enemy ---
  enemy.dy += enemy.gravity;
  enemy.y += enemy.dy;
  enemy.grounded = false;
  for (const p of platforms) {
    if (enemy.x < p.x + p.w && enemy.x + enemy.w > p.x &&
        enemy.y + enemy.h < p.y + 10 && enemy.y + enemy.h + enemy.dy >= p.y) {
      enemy.y = p.y - enemy.h;
      enemy.dy = 0;
      enemy.grounded = true;
    }
  }

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (!enemy.triggered && dist < 300) enemy.triggered = true;

  if (enemy.triggered) {
    enemy.x += Math.sign(dx) * enemy.speed;
    if (enemy.grounded && dy < -40 && Math.abs(dx) < 150) {
      enemy.dy = enemy.jumpPower;
      enemy.grounded = false;
    }
  } else {
    enemy.x += enemy.patrolDir * 0.6;
    if (enemy.x > enemy.spawnX + 50) enemy.patrolDir = -1;
    if (enemy.x < enemy.spawnX - 50) enemy.patrolDir = 1;
  }

  if (enemy.x < 0) enemy.x = 0;
  if (enemy.x + enemy.w > WORLD_WIDTH) enemy.x = WORLD_WIDTH - enemy.w;

  // --- Collision with Enemy ---
  const touchingEnemy =
    player.x < enemy.x + enemy.w &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.height > enemy.y;

  if (touchingEnemy) {
    if (player.y + player.height - player.dy <= enemy.y) {
      player.dy = JUMP_POWER / 2;
      enemy.triggered = false;
      score += 100;
    } else {
      gameOver = true;
    }
  }

  // --- Animation ---
  const frames = player.grounded ? walkFrames : [jumpFrame];
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % frames.length;
      frameCount = 0;
    }
  } else if (player.grounded) currentFrame = 0;

  // --- Camera ---
  cameraX = player.x - canvas.width / 2 + player.width / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - canvas.width));

  // --- Draw ---
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#888";
  for (const p of platforms) ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

  ctx.fillStyle = "#f00";
  ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.w, enemy.h);

  const sprite = frames[currentFrame];
  ctx.save();
  ctx.translate(player.x - cameraX + player.width / 2, player.y + player.height / 2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  ctx.drawImage(sprite, -

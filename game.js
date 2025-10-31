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
  y: 0,
  width: 100,
  height: 100,
  dy: 0,
  grounded: false,
  facingRight: true
};

// --- Game variables ---
const PLAYER_SPEED = 6;
const GRAVITY = 0.7;
const JUMP_POWER = -10;
const WORLD_WIDTH = 2600;
let keys = {};
let currentFrame = 0;
let frameCount = 0;
let frameSpeed = 10;
let cameraX = 0;
let score = 0;
let gameOver = false;
let jumpPressed = false;

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

// --- Input ---
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

// --- Reset ---
function resetGame() {
  player.x = 50;
  player.y = platforms[0].y - player.height;
  player.dy = 0;
  player.grounded = true;
  player.facingRight = true;
  score = 0;
  gameOver = false;
  loop();
}

// --- Update ---
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
  if (keys.left) { player.x -= PLAYER_SPEED; player.facingRight = false; moving = true; }
  if (keys.right) { player.x += PLAYER_SPEED; player.facingRight = true; moving = true; }

  // Physics
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
  } else {
    player.y = nextY;
    player.grounded = groundedThisFrame;
  }

  player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.width));

  // --- Animate ---
  const frames = player.grounded ? walkFrames : [jumpFrame];
  if (moving && player.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
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

  const sprite = frames[currentFrame];
  ctx.drawImage(sprite, player.x - cameraX, player.y, player.width, player.height);

  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 20, 30);

  requestAnimationFrame(update);
}

// --- Start after images loaded ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + 1) resetGame();
  };
});

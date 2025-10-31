const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- Sprites ---
const walkFrames = [
  "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png"
].map(name => {
  const img = new Image();
  img.src = `https://raw.githubusercontent.com/FISHerBRick/fish-runner/main/${name}`;
  return img;
});

// Jump sprite (optional, you can replace with your actual jump sprite)
const jumpFrame = new Image();
jumpFrame.src = "https://raw.githubusercontent.com/FISHerBRick/fish-runner/main/WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png";

let currentFrame = 0;
let frameCount = 0;
const frameSpeed = 8;

// --- Game variables ---
let gravity = 0.6;
let gameSpeed = 5;
let score = 0;
let groundX = 0;
let spawnTimer = 0;
let obstacles = [];
let gameOver = false;

// --- Fish Player ---
const fish = {
  x: 50,
  y: canvas.height - 60,
  width: 60,
  height: 60,
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

    if (this.y > canvas.height - this.height - 10) {
      this.y = canvas.height - this.height - 10;
      this.dy = 0;
      this.grounded = true;
    }
  },
  draw() {
    const sprite = this.grounded ? walkFrames[currentFrame] : jumpFrame;
    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
  }
};

// --- Obstacles ---
function spawnObstacle() {
  const height = 40;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - height - 10,
    width: 20 + Math.random() * 20,
    height: height
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

    // Collision
    if (
      fish.x < obs.x + obs.width &&
      fish.x + fish.width > obs.x &&
      fish.y < obs.y + obs.height &&
      fish.y + fish.height > obs.y
    ) {
      gameOver = true;
    }

    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }
}

function drawObstacles() {
  ctx.fillStyle = "#228B22";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

// --- Ground ---
function drawGround() {
  groundX -= gameSpeed;
  if (groundX <= -canvas.width) groundX = 0;
  ctx.fillStyle = "#888";
  ctx.fillRect(groundX, canvas.height - 10, canvas.width * 2, 10);
}

// --- Score ---
function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);
}

// --- Reset ---
function resetGame() {
  obstacles = [];
  gameSpeed = 5;
  score = 0;
  gameOver = false;
  fish.y = canvas.height - fish.height - 10;
  fish.dy = 0;
  loop();
}

// --- Main Loop ---
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  fish.update();
  updateObstacles();
  fish.draw();
  drawObstacles();
  drawScore();

  // Animate fish running
  if (fish.grounded) {
    frameCount++;
    if (frameCount >= frameSpeed) {
      currentFrame = (currentFrame + 1) % walkFrames.length;
      frameCount = 0;
    }
  } else {
    currentFrame = 0; // jump frame handled separately
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

  requestAnimationFrame(loop);
}

// --- Controls ---
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") fish.jump();
  if (e.code === "KeyR" && gameOver) resetGame();
});

// --- Start game after images loaded ---
let imagesLoaded = 0;
[...walkFrames, jumpFrame].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === walkFrames.length + 1) loop();
  };
});

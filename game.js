const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const walkFrames = [
  "WhatsApp_Image_2025-10-31_at_17.54.47_3f52f1be-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.51_96433c19-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.54.55_364fb04c-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.00_aec8cfdd-removebg-preview.png",
  "WhatsApp_Image_2025-10-31_at_17.55.04_92df43ed-removebg-preview.png"
];

const images = [];
let imagesLoaded = 0;

walkFrames.forEach((src, i) => {
  images[i] = new Image();
  images[i].src = src;
  images[i].onload = () => {
    imagesLoaded++;
    console.log(`Loaded image ${i}: ${src}`);
    if (imagesLoaded === walkFrames.length) {
      startGame();
    }
  };
  images[i].onerror = () => console.error("Failed to load:", src);
});

function startGame() {
  console.log("All images loaded! Starting game.");

  const fish = {
    x: 50,
    y: canvas.height - 60,
    width: 60,
    height: 60,
    dy: 0,
    jumpForce: -12,
    grounded: true,
    currentFrame: 0,
    frameCount: 0,
    frameSpeed: 8,
    jump() {
      if (this.grounded) {
        this.dy = this.jumpForce;
        this.grounded = false;
      }
    },
    update() {
      this.dy += 0.6;
      this.y += this.dy;
      if (this.y > canvas.height - this.height - 10) {
        this.y = canvas.height - this.height - 10;
        this.dy = 0;
        this.grounded = true;
      }
    },
    draw() {
      const sprite = this.grounded ? images[this.currentFrame] : images[2];
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
      if (this.grounded) {
        this.frameCount++;
        if (this.frameCount >= this.frameSpeed) {
          this.currentFrame = (this.currentFrame + 1) % images.length;
          this.frameCount = 0;
        }
      } else {
        this.currentFrame = 2;
      }
    }
  };

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fish.update();
    fish.draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", e => {
    if (e.code === "Space") fish.jump();
  });

  loop();
}

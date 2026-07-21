const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const smallCatchesEl = document.getElementById("small-catches");
const bestEl = document.getElementById("best");

const W = canvas.width;
const H = canvas.height;

const keys = {};

const boat = {
  x: W * 0.5,
  y: 70,
  width: 180,
  height: 70,
};

const hook = {
  x: W * 0.5,
  y: H * 0.24,
  speed: 310,
  size: 16,
};

const anchor = {
  x: boat.x + 18,
  y: boat.y + 28,
};

const fishTypes = [
  { name: "small", size: 24, score: 10, color: "#ff6f61", penalty: 0 },
  { name: "medium", size: 34, score: -4, color: "#ffb347", penalty: 4 },
  { name: "large", size: 46, score: -7, color: "#3ecf8e", penalty: 7 },
  { name: "giant", size: 58, score: -12, color: "#7b68ee", penalty: 12 },
];

const fishes = [];
let score = 0;
let smallCatches = 0;
let best = 0;
let spawnTimer = 0.7;
let lastTime = 0;
let gameTime = 0;

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

function spawnFish() {
  const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
  fishes.push({
    x: W + 40,
    y: H * 0.28 + Math.random() * (H * 0.6),
    size: type.size,
    speed: 90 + Math.random() * 70,
    color: type.color,
    type: type.name,
    penalty: type.penalty,
    score: type.score,
  });
}

function updateScoreboard() {
  scoreEl.textContent = score;
  smallCatchesEl.textContent = smallCatches;
  bestEl.textContent = best;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function update(delta) {
  gameTime += delta;

  if (keys.ArrowLeft) {
    hook.x -= hook.speed * delta;
  }
  if (keys.ArrowRight) {
    hook.x += hook.speed * delta;
  }
  if (keys.ArrowUp) {
    hook.y -= hook.speed * delta;
  }
  if (keys.ArrowDown) {
    hook.y += hook.speed * delta;
  }

  hook.x = clamp(hook.x, 90, W - 90);
  hook.y = clamp(hook.y, 120, H - 90);
  anchor.x = boat.x + 18;
  anchor.y = boat.y + 28;

  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    spawnFish();
    spawnTimer = 0.65 + Math.random() * 0.6;
  }

  for (let i = fishes.length - 1; i >= 0; i -= 1) {
    const fish = fishes[i];
    fish.x -= fish.speed * delta;

    if (Math.hypot(fish.x - hook.x, fish.y - hook.y) < fish.size * 0.55 + hook.size) {
      if (fish.type === "small") {
        score += fish.score;
        smallCatches += 1;
      } else {
        score = Math.max(0, score - fish.penalty);
      }
      best = Math.max(best, score);
      fishes.splice(i, 1);
      updateScoreboard();
      continue;
    }

    if (fish.x + fish.size < -40) {
      fishes.splice(i, 1);
    }
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#5ec8ff");
  sky.addColorStop(0.55, "#1d6fa6");
  sky.addColorStop(1, "#07203a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(110, 110, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(260, 70, 24, 0, Math.PI * 2);
  ctx.arc(292, 92, 34, 0, Math.PI * 2);
  ctx.arc(324, 74, 26, 0, Math.PI * 2);
  ctx.fill();

  const water = ctx.createLinearGradient(0, H * 0.24, 0, H);
  water.addColorStop(0, "#1473ab");
  water.addColorStop(1, "#0a3048");
  ctx.fillStyle = water;
  ctx.fillRect(0, H * 0.24, W, H * 0.76);

  ctx.strokeStyle = "rgba(255,255,255,0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 32) {
    const y = H * 0.29 + Math.sin((x + gameTime * 46) / 60) * 8;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

function drawBoat() {
  ctx.save();
  ctx.translate(boat.x, boat.y);

  ctx.fillStyle = "#7a4b2b";
  ctx.beginPath();
  ctx.moveTo(-90, 20);
  ctx.quadraticCurveTo(0, -20, 90, 20);
  ctx.lineTo(70, 24);
  ctx.lineTo(50, 48);
  ctx.lineTo(-50, 48);
  ctx.lineTo(-70, 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3d2a15";
  ctx.fillRect(-46, 0, 92, 16);
  ctx.fillRect(-18, -26, 10, 28);
  ctx.fillStyle = "#e4d9c5";
  ctx.fillRect(-84, 18, 168, 8);
  ctx.fillStyle = "#f06292";
  ctx.fillRect(-68, -22, 18, 10);

  ctx.restore();
}

function drawHook() {
  ctx.strokeStyle = "#f2d9b8";
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(hook.x, hook.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(hook.x, hook.y, hook.size, 0, Math.PI * 2);
  ctx.fillStyle = "#c96b2d";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(hook.x - 10, hook.y + 5);
  ctx.lineTo(hook.x + 12, hook.y - 8);
  ctx.strokeStyle = "#854321";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFish(fish) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(1, 1);

  ctx.fillStyle = fish.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, fish.size * 0.7, fish.size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-fish.size * 0.65, -3);
  ctx.lineTo(-fish.size * 1.05, -fish.size * 0.25);
  ctx.lineTo(-fish.size * 0.65, fish.size * 0.25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1f1b24";
  ctx.beginPath();
  ctx.arc(fish.size * 0.25, -2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0c2433";
  ctx.beginPath();
  ctx.moveTo(fish.size * 0.75, -4);
  ctx.quadraticCurveTo(fish.size * 1.24, 0, fish.size * 0.75, 4);
  ctx.lineTo(fish.size * 0.58, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function draw() {
  drawBackground();
  drawBoat();
  drawHook();

  for (const fish of fishes) {
    drawFish(fish);
  }
}

function loop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(loop);
}

updateScoreboard();
requestAnimationFrame(loop);
<template>
  <div class="galaxy-background min-h-screen flex flex-col items-center justify-center">
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="clouds"></div>
    <span class="text-white text-2xl font-bold z-20 relative mb-8"
      >Hi, welcome to the galaxy!</span
    >
    <div class="snake-game z-20 relative">
      <canvas ref="gameCanvas" width="300" height="300"></canvas>
      <div class="game-info">
        <p>Score: {{ score }}</p>
        <button @click="startGame" :disabled="gameRunning">Start Game</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const gameCanvas = ref(null);
const score = ref(0);
const gameRunning = ref(false);

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let gameLoop;

const startGame = () => {
  if (gameRunning.value) return;
  gameRunning.value = true;
  snake = [{ x: 10, y: 10 }];
  score.value = 0;
  dx = 10;
  dy = 0;
  placeFood();
  gameLoop = setInterval(updateGame, 100);
};

const updateGame = () => {
  const canvas = gameCanvas.value;
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    placeFood();
  } else {
    snake.pop();
  }

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, 10, 10);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 10, 10);

  // Check for game over
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
  }

  // Check if snake hits itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
};

const placeFood = () => {
  food.x = Math.floor(Math.random() * 30) * 10;
  food.y = Math.floor(Math.random() * 30) * 10;
};

const gameOver = () => {
  clearInterval(gameLoop);
  gameRunning.value = false;
  alert(`Game Over! Your score: ${score.value}`);
};

onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if (!gameRunning.value) return;
    switch (e.key) {
      case "ArrowUp":
        dx = 0;
        dy = -10;
        break;
      case "ArrowDown":
        dx = 0;
        dy = 10;
        break;
      case "ArrowLeft":
        dx = -10;
        dy = 0;
        break;
      case "ArrowRight":
        dx = 10;
        dy = 0;
        break;
    }
  });
});

onUnmounted(() => {
  clearInterval(gameLoop);
});
</script>

<style scoped>
.galaxy-background {
  background: #000 url("https://i.imgur.com/wZSIZ9h.png") repeat top center;
  position: relative;
  overflow: hidden;
}

.stars,
.twinkling,
.clouds {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars {
  background: #000 url("https://i.imgur.com/YKY28eT.png") repeat top center;
  z-index: 0;
}

.twinkling {
  background: transparent url("https://i.imgur.com/XYMF4ca.png") repeat top center;
  z-index: 1;
  animation: move-twinkle-back 800s linear infinite;
}

.clouds {
  background: transparent url("https://i.imgur.com/mHbScrQ.png") repeat top center;
  z-index: 2;
  opacity: 0.4;
  animation: move-clouds-back 800s linear infinite;
}

@keyframes move-twinkle-back {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -10000px 5000px;
  }
}

@keyframes move-clouds-back {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 10000px 0;
  }
}

.snake-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

canvas {
  border: 2px solid white;
}

.game-info {
  margin-top: 10px;
  color: white;
  text-align: center;
}

button {
  background: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>

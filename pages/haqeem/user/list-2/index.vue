<template>
  <div
    class="galaxy-background min-h-screen flex flex-col items-center justify-center"
  >
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="clouds"></div>
    <span class="text-white text-2xl font-bold z-20 relative mb-8"
      >Whack-a-Space-Mole!</span
    >
    <div class="whack-a-mole-game z-20 relative">
      <div class="game-info">
        <p>Score: {{ score }}</p>
        <p>Time: {{ timeLeft }}s</p>
        <button @click="startGame" :disabled="gameRunning">Start Game</button>
      </div>
      <div class="game-grid">
        <div
          v-for="(hole, index) in holes"
          :key="index"
          class="hole"
          @click="whackMole(index)"
        >
          <div class="mole" :class="{ show: hole.hasMole }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";

const score = ref(0);
const timeLeft = ref(30);
const gameRunning = ref(false);
const holes = ref(
  Array(9)
    .fill()
    .map(() => ({ hasMole: false }))
);

let gameLoop;
let moleAppearInterval;

const startGame = () => {
  if (gameRunning.value) return;
  gameRunning.value = true;
  score.value = 0;
  timeLeft.value = 30;

  gameLoop = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      endGame();
    }
  }, 1000);

  moleAppearInterval = setInterval(showRandomMole, 1000);
};

const showRandomMole = () => {
  const emptyHoles = holes.value
    .map((hole, index) => ({ index, hole }))
    .filter((h) => !h.hole.hasMole);
  if (emptyHoles.length > 0) {
    const randomHole =
      emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
    holes.value[randomHole.index].hasMole = true;
    setTimeout(() => {
      holes.value[randomHole.index].hasMole = false;
    }, 800);
  }
};

const whackMole = (index) => {
  if (!gameRunning.value) return;
  if (holes.value[index].hasMole) {
    score.value += 10;
    holes.value[index].hasMole = false;
  }
};

const endGame = () => {
  clearInterval(gameLoop);
  clearInterval(moleAppearInterval);
  gameRunning.value = false;
  alert(`Game Over! Your score: ${score.value}`);
};

onUnmounted(() => {
  clearInterval(gameLoop);
  clearInterval(moleAppearInterval);
});
</script>

<style scoped>
/* Keep the existing galaxy-background styles */
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

.whack-a-mole-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.game-info {
  margin-bottom: 20px;
  color: white;
  text-align: center;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.hole {
  width: 80px;
  height: 80px;
  background-color: #444;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.mole {
  width: 100%;
  height: 100%;
  background-color: green;
  border-radius: 50%;
  position: absolute;
  bottom: 100%;
  transition: bottom 0.1s;
}

.mole.show {
  bottom: 0;
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

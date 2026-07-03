// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countDownInterval; // Will store our countdown timer
let collisionIntervals = [];
let timerValue; // Will store the total time for timer
let lives; // Will store lives
let livesDisplay = document.querySelector("#lives");
let timeDisplay = document.querySelector("#time");
let filled = 0;
let score = 0;
let scoreDisplay = document.querySelector("#score");
const milestoneDisplay = document.getElementById("milestone-message");
const waterCan = document.getElementById("water-can");
const gameContainer = document.getElementById("game-container");
const initialCanPosition = { left: 350, top: 470 };
const difficultySelect = document.getElementById("difficulty");// Store difficulty selected
const maxLimit ;//Max limit will be difficulty based
const waterCollect = new Audio("sounds/slosh.mp3");
const stickHit = new Audio("sounds/crunch.mp3");
const confettiSound = new Audio("sounds/party-horn.mp3");

let holdingCan = false;

// Jerry Can states

const canStates = ["img/water-can-transparent.png","img/can-fill1.png","img/can-fill2.png","img/can-fill3.png","img/can-fill4.png"];

const winMess = ["You did great!","You've survived this Winter!", "No Snow is keeping you down"];
const loseMess = ["Too many sticks in the way!", "You going to need a new water can!", "Too Tired?!"];
const mileStones = ["Good Amount of Water There!", "Keep Going!", "Not too cold for you!"]

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Restart button click event
document.getElementById("restart-btn").addEventListener("click", restartGame);

difficultySelect.addEventListener("change", restartGame);

function clearGameIntervals() {
  clearInterval(dropMaker);
  clearInterval(countDownInterval);

  collisionIntervals.forEach((intervalId) => clearInterval(intervalId));
  collisionIntervals = [];
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  restartGame(); // Reset game state before starting

  gameRunning = true;

  // Create new drops interval
  if(difficultySelect.value === "easy"){
    dropMaker = setInterval(createDrop, 450);
    maxLimit = 10;
  }else if(difficultySelect.value === "medium"){
    dropMaker = setInterval(createDrop, 300);
    maxLimit = 15;
  }else if(difficultySelect.value === "hard"){
    dropMaker = setInterval(createDrop, 250);
    maxLimit = 20;
  }

  // Start timer
  startCountDown();
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  const dropImage = document.createElement("img");
  dropImage.src = "img/waterDrop.png";


  let isBad = 0;
  let isPlus = 0;
  // Difficulty for bad drops
  if(difficultySelect.value === "easy"){
    isBad = Math.random() < 0.2;
    isPlus = Math.random() < 0.2;
  }else if(difficultySelect.value === "medium"){
    isBad = Math.random() < 0.3;
    isPlus = Math.random() < 0.15;
  }else if(difficultySelect.value === "hard"){
    isBad = Math.random() < 0.4;
    isPlus = Math.random() < 0.10;
  }

  let isSnow =Math.random() < 0.5;

  if(isBad){
    drop.classList.add("bad-drop");
    dropImage.src = "img/stick.png";
  }else if(isPlus){
    drop.classList.add("plus-drop");
    dropImage.src = "img/plus10.png";
  }else{
    if(isSnow){
      dropImage.src = "img/snowflake.png";
    }
  }
  dropImage.alt = "Water Drop";

  drop.appendChild(dropImage);

  // Make drops different sizes for visual variety
  // Scale drop size based on game container width for responsive design
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const containerHeight = document.getElementById("game-container").offsetHeight;
  
  // Calculate initial size based on container width (responsive)
  let initialSize;
  if (gameWidth <= 400) {
    initialSize = 40; // Small phones
  } else if (gameWidth <= 500) {
    initialSize = 55; // Medium phones
  } else if (gameWidth <= 700) {
    initialSize = 75; // Tablets
  } else {
    initialSize = 100; // Desktop
  }
  
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract size to keep drops fully inside the container
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "3s";
  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Check drop collison
  checkCollision(drop);
  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Count down function
function startCountDown(){
  countDownInterval = setInterval(function(){
    // Decrement timer value
    timerValue--;

    timeDisplay.textContent = timerValue;

    // Timer has reached 0
    if(timerValue <= 0){
      clearInterval(countDownInterval);
      gameOver();
    }

    if(score >= maxLimit){
      clearInterval(countDownInterval);
      gameOver();
    }
  }, 1000);
}

// Desktop + Mobile press
function pickUpCan(event){

    if (!gameRunning || event.target !== waterCan) return;

    holdingCan = true;
    waterCan.style.cursor = "grabbing";
    if (event.touches && event.cancelable) {
        event.preventDefault();
    }

}


// Release
function dropCan(){

    if (!gameRunning) return;

    holdingCan = false;
    waterCan.style.cursor = "grab";

}


// Move function (works for mouse + touch)
function moveCan(event){

    if(!gameRunning || !holdingCan) return;


    const rect = gameContainer.getBoundingClientRect();


    let clientX;
    let clientY;


    // Mobile touch position
    if(event.touches){

        if (event.cancelable) {
            event.preventDefault();
        }
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;

    }
    // Desktop mouse position
    else{

        clientX = event.clientX;
        clientY = event.clientY;

    }


    let x = clientX - rect.left - waterCan.offsetWidth / 2;
    let y = clientY - rect.top - waterCan.offsetHeight / 2;


    // Keep can inside game area
    x = Math.max(
        0,
        Math.min(x, gameContainer.clientWidth - waterCan.offsetWidth)
    );


    y = Math.max(
        0,
        Math.min(y, gameContainer.clientHeight - waterCan.offsetHeight)
    );


    waterCan.style.left = x + "px";
    waterCan.style.top = y + "px";

}


// Mouse controls
gameContainer.addEventListener("mousedown", pickUpCan);

gameContainer.addEventListener("mousemove", moveCan);

document.addEventListener("mouseup", dropCan);


// Mobile controls
gameContainer.addEventListener("touchstart", pickUpCan);

gameContainer.addEventListener("touchmove", moveCan);

document.addEventListener("touchend", dropCan);

// Collision check function
function showMilestoneMessage() {
  if (score > 0 && score % 5 === 0) {
    const milestoneIndex = (score / 5) - 1;
    milestoneDisplay.textContent = mileStones[Math.floor(Math.random() * mileStones.length)];
  }
}

function createConfettiBurst() {
  const colors = ["#FFC907", "#2E9DF7", "#4FCB53", "#F16061", "#FFFFFF"];

  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 20 + 10}%`;
    piece.style.setProperty("--x-offset", `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty("--y-offset", `${Math.random() * 220 + 80}px`);
    piece.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.15}s`);
    gameContainer.appendChild(piece);

    setTimeout(() => piece.remove(), 1200);
  }
}


function checkCollision(drop){
  const collisionInterval = setInterval(()=>{
    if (!gameRunning || !drop.parentElement){
      clearInterval(collisionInterval);
      collisionIntervals = collisionIntervals.filter((intervalId) => intervalId !== collisionInterval);
      return;
    }

    const dropRect = drop.getBoundingClientRect();
    const canRect = waterCan.getBoundingClientRect();

    const hit =
      dropRect.left < canRect.right &&
      dropRect.right > canRect.left &&
      dropRect.top < canRect.bottom &&
      dropRect.bottom > canRect.top;

    if(hit){
      clearInterval(collisionInterval);
      collisionIntervals = collisionIntervals.filter((intervalId) => intervalId !== collisionInterval);

      if(drop.classList.contains("plus-drop")){
        timerValue += 10;
        timeDisplay.textContent = timerValue;
      }
      // WATER DROP
      else if(drop.classList.contains("bad-drop") === false){
        filled++;
        waterCan.src = canStates[filled];
        if(filled == 5){
          filled = 0;
          score++;
          scoreDisplay.textContent = score;
          showMilestoneMessage();
          waterCan.src = canStates[0];
          waterCollect.play();
          if (score % 5 === 0) {
            createConfettiBurst();
            confettiSound.play();
          }
        }
        else{
          waterCollect.play();
        }
      }
      // OBSTACLE
      else {
        lives--;
        livesDisplay.textContent =
          "💧 ".repeat(lives);
        stickHit.play();
        if(lives <= 0){
          waterCan.src="img/ruined-can.png";
          gameOver();
        }
        if(timerValue >= 30){
          if(difficultySelect.value === "easy"){
            timerValue -= 20;
          }else if(difficultySelect.value === "medium"){
            timerValue -= 22;
          }else if(difficultySelect.value === "hard"){
            timerValue -= 25;
          }
          timeDisplay.textContent = timerValue;
        }
      }
      drop.remove();
    }
  },50);

  collisionIntervals.push(collisionInterval);
}

function showGameOverModal() {
  hideGameOverModal();

  const modal = document.createElement("div");
  modal.id = "game-over-modal";

  const content = document.createElement("div");
  content.className = "game-over-content";

  const messagePool = lives <= 0 ? loseMess : winMess; // Select array based on lives
  const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];

  if (lives <= 0) {
    content.innerHTML = `
      <h2>Game Over</h2>
      <p>${randomMessage}</p>
      <p>Your score: ${score}</p>
      <p>Click anywhere within the game to close message.</p>
    `;
  } else {
    content.innerHTML = `
      <h2>The Water is Saved!</h2>
      <p>${randomMessage}</p>
      <p>Your score: ${score}</p>
      <p>Click anywhere within the game to close message.</p>
    `;
  }
  content.addEventListener("click", (event) => event.stopPropagation());
  modal.addEventListener("click", hideGameOverModal);

  modal.appendChild(content);
  gameContainer.appendChild(modal);
}

function hideGameOverModal() {
  const modal = document.getElementById("game-over-modal");
  if (modal) {
    modal.remove();
  }
}

function gameOver(){
  if (!gameRunning) return;

  gameRunning = false;
  holdingCan = false;
  waterCan.style.cursor = "grab";

  clearGameIntervals();

  showGameOverModal();

}

function restartGame() {
  hideGameOverModal();

  // Stop any running game timers
  gameRunning = false;
  clearGameIntervals();

  // Remove all existing drops from the screen
  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  // Reset game values and UI
  filled = 0;
  score = 0;
  lives = 5;
  timerValue = 30;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = "💧 ".repeat(lives);
  timeDisplay.textContent = timerValue;
  milestoneDisplay.textContent = "";
  waterCan.src = canStates[0];

  // Return the can to its initial position
  const startX = (gameContainer.clientWidth - waterCan.offsetWidth) / 2;
  const startY = gameContainer.clientHeight - waterCan.offsetHeight - 20;

  waterCan.style.left = `${startX}px`;
  waterCan.style.top = `${startY}px`;
}
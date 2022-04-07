const GAME_TICK_RATE = 20
const intervals = new Set()
const timeouts = new Set()
let GAME_OVER = false
let scoreValue = 0
const score = document.getElementById("score")

// dino
const dino = document.getElementById("dino")
const MIN_POSITION = 100
const MAX_POSITION = MIN_POSITION + 150
const POSITION_RATE = 20
const POSITION_UNIT = 'px'
let isJumping = false
let position = MIN_POSITION

// cactus
const CACTUS_POSITION_RATE = 10
const CACTUS_POSITION_REMOVE = -60
const CACTUS_POSITION_UNIT = 'px'

// background
const background = document.getElementById("background")
const backgroundAnimation = getComputedStyle(background).animation


function handleKeyUp(ev){
// keyCode is deprecated therefore this option is cross browser friendly
  let key = ev.key || ev.keyCode
  if(key === " " || key === 32){
    if(!isJumping && !GAME_OVER){
      jump()
    }
  }
  if(key === "Enter" || key === 13){
    if(GAME_OVER){
      restartGame()
    }
  }
}

function jump(){
  isJumping = true
  position = MIN_POSITION;

  let upInterval = setInterval(() => {
    saveInterval(upInterval)
    if(position >= MAX_POSITION){
      deleteAndClearInterval(upInterval)

      let downInterval = setInterval(() =>{
        saveInterval(downInterval)
        if(position <= MIN_POSITION){
          deleteAndClearInterval(downInterval)
          isJumping = false
        } else {
          // go down in position
          position -= POSITION_RATE
          dino.style.bottom = position + POSITION_UNIT
        }
      }, GAME_TICK_RATE)
    } else {
      // go up in position
      position += POSITION_RATE
      dino.style.bottom = position + POSITION_UNIT
    }
  }, GAME_TICK_RATE)
}

function createCactus(){
  if(GAME_OVER) return

  const cactus = document.createElement("div")
  cactus.classList.add("cactus")
  cactus.style.bottom = MIN_POSITION + POSITION_UNIT;
  let cactusStartPos = parseInt(getComputedStyle(background).width) + 100
  cactus.style.left = cactusStartPos + "px"

  background.appendChild(cactus)
  moveCactus(cactus, cactusStartPos)

  // call it again
  let randomTimeout = Math.max(0.08, Math.random()) * 6000
  let timeout = setTimeout(createCactus, randomTimeout)
  timeouts.add(timeout)
}

function moveCactus(cactus, cactusPosition){
  let leftInterval = setInterval(() => {
    saveInterval(leftInterval)
    if(cactusPosition <= CACTUS_POSITION_REMOVE){
      deleteAndClearInterval(leftInterval)
      background.removeChild(cactus)
    } else if (cactusCollide(cactusPosition)){
      deleteAndClearInterval(leftInterval)
      gameOver()
    }
    else {
      cactusPosition -= CACTUS_POSITION_RATE
      cactus.style.left = cactusPosition + CACTUS_POSITION_UNIT
    }
  }, GAME_TICK_RATE)
}

function cactusCollide(cactusPosition){
  return cactusPosition > 0 && cactusPosition < 60 && position < (MIN_POSITION + 60)
}

function gameOver(){
  GAME_OVER = true

  // clear processes in the pipe
  intervals.forEach(i => clearInterval(i))
  intervals.clear()

  timeouts.forEach(t => clearTimeout(t))
  timeouts.clear()

  // game over screen
  background.style.animation = "none"
  let gameOverElement = document.createElement("div")
  gameOverElement.classList.add("game-over")
  gameOverElement.innerHTML = `Fim de Jogo <br> Pressione \"Enter\" para reiniciar`
  document.body.appendChild(gameOverElement)
}

function saveInterval(interval){
  if(GAME_OVER) {
    deleteAndClearInterval(interval)
  } else {
    intervals.add(interval)
  }
}

function deleteAndClearInterval(interval){
  intervals.delete(interval)
  clearInterval(interval)
}

function restartGame(){
  document.querySelectorAll(".cactus")
  .forEach(e => background.removeChild(e))

  let gameOverScreen = document.querySelector(".game-over")
  document.body.removeChild(gameOverScreen)

  startGame()
}

function startGame(){
  dino.style.bottom = MIN_POSITION + POSITION_UNIT;
  background.style.paddingBottom = MIN_POSITION + POSITION_UNIT;
  background.style.animation = backgroundAnimation;

  GAME_OVER = false
  isJumping = false
  scoreValue = 0
  createCactus()

  // count score
  let scoreInterval = setInterval(() => {
    ++scoreValue
    score.innerHTML = `Pontos: ${scoreValue}`
  }, GAME_TICK_RATE)
  intervals.add(scoreInterval)
}

// init
document.onkeyup = (ev) => handleKeyUp(ev);
startGame()
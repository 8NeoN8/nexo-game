//* DATA VARIABLES

//*Canvas
const canvas = document.getElementById('game-canvas')
const context = canvas.getContext('2d')
const floor = document.getElementById('floor')

let canvasWidth = 350
let canvasHeight = 250

//*Game variables
let scorePoints = 0
let velocityX = -6
let velocityY = 0
let gravity = 0.4
let gameOver = false
let isGameOn = false
let score = 0
let frameCount = 0
let groundAnimationFrame = 1 //* 12 frame walk cicle (to begin with and test)
let airAnimationFrame = 0 //* 1 frame jump squat - jump sprite until landing
let isViruAir = false


//*Viru 
let viruWidth = 90
let viruHeight = 35
let viruPosX = 5
let virusPosY = canvasHeight - viruHeight 
let viruStandImg = new Image()
let viruLeftImg = new Image()
let viruRightImg = new Image()
let viruJumpSquatImg = new Image()
let viruAirImg = new Image()
viruStandImg.src = './images/player_viru.png'
viruLeftImg.src = './images/player_viru_walk_left.png'
viruRightImg.src = './images/player_viru_walk_right.png'
viruJumpSquatImg.src = './images/player_viru_jumpsquat.png'
viruAirImg.src = './images/player_viru_airborn.png'

let viru = {
  width: viruWidth,
  height: viruHeight,
  x: viruPosX,
  y: virusPosY,
  images: {
    standing: viruStandImg,
    leftWalk: viruLeftImg,
    rightWalk: viruRightImg,
    squat: viruJumpSquatImg,
    air: viruAirImg
  }
}

//*Pregame setup
floor.setAttribute('height','50px')
setCanvasDimensions()
if (window.matchMedia('screen and (min-width: 413px)').matches) {
  canvasWidth = 420
  setCanvasDimensions()
  velocityX = -8
}

if (window.matchMedia('screen and (min-width: 431px)').matches) {
  canvasWidth = 450
  setCanvasDimensions()
  velocityX = -10
}

if (window.matchMedia('screen and (min-width: 520px)').matches) {
  canvasWidth = 550
  velocityX = -12

  setCanvasDimensions()
}

if (window.matchMedia('screen and (min-width: 760px)').matches) {
  canvasWidth = 750
  setCanvasDimensions()
  velocityX = -15
}

//*Obstacles
let obstacleArray = []
let obstacleX = canvasWidth
let obstacleHeight = 50
let obstacleY = canvasHeight - obstacleHeight
let obstacleSingleWidth = 40
let obstacleDoubleWidth = 80
let obstacleTripleWidth = 120
let obstacleSingleImg = new Image()
let obstacleDoubleImg = new Image()
let obstacleTripleImg = new Image()
obstacleSingleImg.src = './images/obstacle_pixel_single.png'
obstacleDoubleImg.src = './images/obstacle_pixel_double.png'
obstacleTripleImg.src = './images/obstacle_pixel_triple.png'

//* DATA VARIABLES



//*Setup
window.addEventListener('keydown', (e) => {

  if(e.key == 'Enter' && !isGameOn){

    isGameOn = true

    requestAnimationFrame(gameUpdate)

    setInterval(() => {
      drawObstacle()
    }, 1200);

  }

  if(e.code == 'Space' && isGameOn){
    movePlayer(e)
  }

  if(e.key == 'ArrowUp' && isGameOn){
    movePlayer(e)
  }
})
window.addEventListener('click', (e) => {
  if(isGameOn && !gameOver) movePlayer(e)
  if(gameOver){
    restartGame()
    return
  }
  if(!isGameOn){
    isGameOn = true

    requestAnimationFrame(gameUpdate)

    setInterval(() => {
      drawObstacle()
    }, 1200);
  }
})

context.fillStyle = 'whitesmoke'
context.fillRect(0,0, canvasWidth,canvasHeight)
context.fillStyle = 'green'
context.font = "34px serif";
context.fillText('Click to start', 10, 50);
viru.images.standing.onload = function(){
  context.drawImage(viru.images.standing, viru.x, viru.y, viru.width, viru.height)
}
//*Setup

//*Functions
function gameUpdate(){
  clearCanvas()
  drawGame()
  velocityY += gravity
  viru.y = Math.min(viru.y + velocityY, canvasHeight - viru.height)
  drawViru()
  
  for (let i = 0; i < obstacleArray.length; i++) {
    
    let obstacle = obstacleArray[i]
    
    obstacle.x += velocityX
    context.drawImage(obstacle.img,obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    
    if(detectCollition(viru, obstacle)){
      setGameOver()
    }
  }
  
  if(gameOver) return
  drawScore()
  requestAnimationFrame(gameUpdate)
}

function clearCanvas(){
  context.clearRect(0,0, canvasWidth,canvasHeight)
}

function drawGame(){
  context.fillStyle = 'whitesmoke'
  context.fillRect(0,0, canvasWidth,canvasHeight)
}

function drawViru(){
  if(viru.y == (canvasHeight - viruHeight)){
    airAnimationFrame = 0
    isViruAir = false
  }

  if(isViruAir) airAnimationFrame++

  if (airAnimationFrame >= 1) {
    context.drawImage(viru.images.squat, viru.x, viru.y, viru.width, viru.height) 
  }
  
  if (airAnimationFrame >= 5 && isViruAir) {
    context.drawImage(viru.images.air, viru.x, viru.y, viru.width, viru.height) 
  }

  if(groundAnimationFrame > 0 && groundAnimationFrame <= 8 && !isViruAir){
    context.drawImage(viru.images.leftWalk, viru.x, viru.y, viru.width, viru.height)
  }
  if(groundAnimationFrame > 8 &&groundAnimationFrame <= 16 && !isViruAir){
    context.drawImage(viru.images.standing, viru.x, viru.y, viru.width, viru.height)
  }
  if(groundAnimationFrame > 16 &&groundAnimationFrame <= 24 && !isViruAir){
    context.drawImage(viru.images.rightWalk, viru.x, viru.y, viru.width, viru.height) 
  }
  groundAnimationFrame >= 24 ? groundAnimationFrame = 1 : groundAnimationFrame++

  
  
}

function movePlayer(){
  if(!isViruAir) isViruAir = true
  if(viru.y = virusPosY){
    velocityY = -10
  }
  airAnimationFrame++
}

function drawObstacle(){
  let obstacle = {
    img: null,
    x: obstacleX,
    y: obstacleY,
    width: null,
    height: obstacleHeight,
  }

  let obstacleChance = Math.random()


  if(obstacleChance > 0.9){
    obstacle.width = obstacleTripleWidth
    obstacle.img = obstacleTripleImg
    obstacleArray.push(obstacle)
  }
  if(obstacleChance < 0.9 && obstacleChance > 0.6){
    obstacle.width = obstacleDoubleWidth
    obstacle.img = obstacleDoubleImg
    obstacleArray.push(obstacle)
  }
  if(obstacleChance < 0.55 && obstacleChance > 0.1){
    obstacle.width = obstacleSingleWidth
    obstacle.img = obstacleSingleImg
    obstacleArray.push(obstacle)
  }

  if(obstacleArray.length > 5) obstacleArray.shift()
}

function drawScore(){
  frameCount++
  if(frameCount % 2 == 0){
    score++
  }

  context.fillStyle = 'limegreen'
  context.font = "28px serif";
  context.fillText(score, 20, 40);
}

function detectCollition(a, b){
  return a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y
}

function setGameOver(){
    gameOver = true
    isGameOn = false
    context.fillStyle = 'red'
    context.font = "34px serif";
    context.fillText('Game Over', 10, 50);
    context.font = "24px serif";
    context.fillText(`Score: ${score}`, 10, 75);
    context.font = "16px serif";
    context.fillText('click to restart', 10, 90);
}

function restartGame(){
  gameOver = false
  isGameOn = true
  score = 0
  obstacleArray = []
  clearCanvas()
  drawGame()
  requestAnimationFrame(gameUpdate)
}

function setCanvasDimensions(){
  canvas.setAttribute('height',`${canvasHeight}px`)
  canvas.setAttribute('width',`${canvasWidth}px`)
  floor.setAttribute('width',`${canvasWidth}px`)
}

//*Functions
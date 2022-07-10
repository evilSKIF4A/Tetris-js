/*

  Create by SKIF4A -> https://github.com/evilSKIF4A

*/

function createGameField() {
  let gameField = [];
  for (let x = 0; x < canvas.width / box; x++) {
    gameField[x] = [];

    for (let y = -2; y < canvas.height / box; y++) {
      gameField[x][y] = 0;
    }
  }
  return gameField;
}

function showNextFigure() {
  contextNextFigure.clearRect(
    0,
    0,
    canvasNextFigure.width,
    canvasNextFigure.height
  );
  for (let y = 0; y < nextFigure.matrix.length; y++) {
    for (let x = 0; x < nextFigure.matrix[y].length; x++) {
      if (nextFigure.matrix[y][x]) {
        contextNextFigure.fillStyle = colorFigures[nextFigure.name];
        contextNextFigure.fillRect(
          nextFigure.name === "I" ? (x + 1) * box : (x + 1.5) * box,
          (y + 0.8) * box,
          box - 1,
          box - 1
        );
      }
    }
  }
}

function rotate90(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((y, i) => y.map((val, j) => matrix[N - j][i]));
  return result;
}

function getNextFigure() {
  const nameFigures = ["O", "I", "S", "Z", "L", "J", "T"];
  const name = nameFigures[Math.floor(Math.random() * nameFigures.length)];
  const matrix = figures[name];
  return {
    name: name,
    matrix: matrix,
    x: Math.floor(canvas.width / box / 2.5 + 1),
    y: -2,
  };
}

function isValidMove(matrix, Y, X) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (
        matrix[y][x] &&
        (Y + y < -1 ||
          X + x >= gameField.length ||
          Y + y >= gameField[0].length ||
          gameField[X + x][Y + y])
      ) {
        return false;
      }
    }
  }
  return true;
}

function gameOver() {
  cancelAnimationFrame(startGame);
  context.fillStyle = "black";
  context.fillRect(0, canvas.height / 2 - 120, canvas.width, 180);
  context.fillStyle = "white";
  context.font = "76px monospace";
  context.textAlign = "center";
  context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

function placeFigure() {
  for (let y = 0; y < nowFigure.matrix.length; ++y) {
    for (let x = 0; x < nowFigure.matrix[y].length; ++x) {
      if (nowFigure.y + y < 0) {
        return gameOver();
      }

      if (nowFigure.matrix[y][x]) {
        gameField[nowFigure.x + x][nowFigure.y + y] = nowFigure.name;
      }
    }
  }

  let destroyedLine = 0;
  for (let x = gameField[0].length - 1; x >= 0; x--) {
    let isFullLine = true;
    for (let y = 0; y < gameField.length; y++) {
      if (!gameField[y][x]) {
        isFullLine = false;
      }
    }
    if (isFullLine) {
      destroyedLine++;
      for (let X = x; X >= 1; X--) {
        for (let Y = 0; Y < gameField.length; Y++) {
          gameField[Y][X] = gameField[Y][X - 1];
          gameField[Y][X - 1] = 0;
        }
      }
      x++;
    }
  }

  switch (destroyedLine) {
    case 1:
      score += 100;
      break;
    case 2:
      score += 300;
      break;
    case 3:
      score += 700;
      break;
    case 4:
      score += 1500;
      break;
  }
  showScore.textContent = score;
  nowFigure = nextFigure;
  nextFigure = getNextFigure();
  showNextFigure();
}

function restartGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  cancelAnimationFrame(startGame);
  score = 0;
  frames = 0;
  showScore.textContent = score;
  gameField = createGameField();
  nowFigure = getNextFigure();
  nextFigure = getNextFigure();
  showNextFigure();
  startGame = requestAnimationFrame(game);
}

function game() {
  startGame = requestAnimationFrame(game);

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width / box; ++x) {
    for (let y = 0; y < canvas.height / box; ++y) {
      if (gameField[x][y]) {
        const name = gameField[x][y];
        context.fillStyle = colorFigures[name];
        context.fillRect(x * box, y * box, box - 1, box - 1);
      }
    }
  }
  if (nowFigure) {
    if (++frames > speedGame) {
      frames = 0;
      nowFigure.y++;
      if (!isValidMove(nowFigure.matrix, nowFigure.y, nowFigure.x)) {
        nowFigure.y--;
        placeFigure();
      }
    }
    context.fillStyle = colorFigures[nowFigure.name];

    for (let y = 0; y < nowFigure.matrix.length; y++) {
      for (let x = 0; x < nowFigure.matrix[y].length; x++) {
        if (nowFigure.matrix[y][x]) {
          context.fillRect(
            (nowFigure.x + x) * box,
            (nowFigure.y + y) * box,
            box - 1,
            box - 1
          );
        }
      }
    }
  }
}

document.addEventListener("keydown", function (e) {
  if (e.which === 37 || e.which === 39) {
    const x = e.which === 37 ? nowFigure.x - 1 : nowFigure.x + 1;

    if (isValidMove(nowFigure.matrix, nowFigure.y, x)) {
      nowFigure.x = x;
    }
  }

  if (e.which === 38) {
    const matrix = rotate90(nowFigure.matrix);
    if (isValidMove(matrix, nowFigure.y, nowFigure.x)) {
      nowFigure.matrix = matrix;
    }
  }

  if (e.which === 40) {
    const y = nowFigure.y + 1;
    if (!isValidMove(nowFigure.matrix, y, nowFigure.x)) {
      nowFigure.y = y - 1;
      placeFigure();
      return;
    }
    nowFigure.y = y;
  }
});

const figures = {
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
  ],
  J: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const colorFigures = {
  O: "yellow",
  I: "blue",
  S: "red",
  Z: "green",
  L: "orange",
  J: "brown",
  T: "purple",
};

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const canvasNextFigure = document.getElementById("nextFigure");
const contextNextFigure = canvasNextFigure.getContext("2d");

const showScore = document.getElementById("score");
var score = 0;

const box = 40;
var frames = 0;
var speedGame = 9;

var gameField = createGameField();
var nowFigure = getNextFigure();
var nextFigure = getNextFigure();
showNextFigure();

var startGame = requestAnimationFrame(game);

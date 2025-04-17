const main = document.getElementById("main");
const gameboard = document.getElementById("gameboard");
const selector = document.querySelector(".selector");
const easy = document.getElementById("easy");
const medium = document.getElementById("medium");
const hard = document.getElementById("hard");
const expert = document.getElementById("expert");
const timer = document.getElementById("timer");
const modal = document.getElementById("modal");
const result = document.getElementById("result");
const totalTime = document.getElementById("modal-time");
const totalErrors = document.getElementById("modal-errors");
const overlay = document.querySelector(".overlay");
const backToMenuBtn = document.getElementById("back-to-menu");
const playAgainBtn = document.getElementById("play-again");

let seconds = 0;
let minutes = 0;
let timerRunning = null;

let mistakes = 0;
let numberOfClues = 0;
let resetDifficulty = "";

const inputRegex = /^[1-9]?$/;

let n = 0;

while (n < 81) {
  const dataCell = document.createElement("div");
  dataCell.classList.add("cell");
  dataCell.setAttribute("data-cell", n);

  if ((n >= 18 && n <= 26) || (n >= 45 && n <= 53)) {
    dataCell.classList.add("bottom");
  } else if ((n >= 27 && n <= 35) || (n >= 54 && n <= 62)) {
    dataCell.classList.add("top");
  }
  gameboard.appendChild(dataCell);

  n++;
}

n = 0;

while (n < 9) {
  const numCard = document.createElement("div");
  numCard.classList = "number-card";
  numCard.id = `card-${n + 1}`;
  const pEl = document.createElement("p");
  pEl.textContent = n + 1;
  pEl.classList = "card-text";
  const counter = document.createElement("div");
  counter.id = `counter-${n + 1}`;
  counter.classList = "counter";
  counter.textContent = 9;
  numCard.appendChild(pEl);
  numCard.appendChild(counter);
  selector.appendChild(numCard);
  n++;
}

const counters = document.querySelectorAll(".counter");

const dataCells = document.querySelectorAll(".cell");

dataCells.forEach((el, index) => {
  if (el.textContent === "") {
    const input = document.createElement("input");
    input.type = "num";
    input.classList = "num-input";
    input.maxLength = "1";
    input.id = `input-${index}`;
    el.appendChild(input);
  }
});

const inputs = document.querySelectorAll(".num-input");

const getRow = (index) => Math.floor(index / 9);
const getCol = (index) => index % 9;
const getBox = (row, col) => Math.floor(row / 3) * 3 + Math.floor(col / 3);

const rows = Array.from({ length: 9 }, () => new Set());
const cols = Array.from({ length: 9 }, () => new Set());
const boxes = Array.from({ length: 9 }, () => new Set());

function validInput(index, value) {
  const row = getRow(index);
  const col = getCol(index);
  const box = getBox(row, col);

  if (value === Number(dataCells[index].getAttribute("data-set"))) {
    return (
      !rows[row].has(value) && !cols[col].has(value) && !boxes[box].has(value)
    );
  } else {
    return false;
  }
}

function handleInput(index, value) {
  const row = getRow(index);
  const col = getCol(index);
  const box = getBox(row, col);
  const counter = document.getElementById(`counter-${value}`);

  if (validInput(index, value)) {
    document.getElementById(`input-${index}`).remove();
    dataCells[index].textContent = value;
    rows[row].add(value);
    cols[col].add(value);
    boxes[box].add(value);
    dataCells[index].classList.remove("invalid");
    counter.textContent = Number(counter.textContent) - 1;
    if (Number(counter.textContent) === 0) {
      const card = document.getElementById(`card-${value}`);
      card.style.display = "none";
    }

    if (![...dataCells].some((div) => div.textContent === "")) {
      showModal();
    }

    return;
  } else if (dataCells[index].classList.contains("invalid")) {
    return mistakes++;
  } else {
    dataCells[index].classList.add("invalid");
    mistakes++;
  }
}

function showModal() {
  startStopTimer("stop");
  result.textContent = mistakes
    ? `You completed the puzzle with ${mistakes} mistakes!`
    : `Woohoo Perfect Game!`;
  totalTime.textContent = `You only took ${
    minutes < 10 ? "0" + minutes : minutes
  } minutes and ${
    seconds < 10 ? "0" + seconds : seconds
  } seconds to complete the puzzle!${
    minutes < 10
      ? minutes < 2
        ? " WTF HOW, if the difficulty isn't easy"
        : " You're a RockStar!"
      : ""
  }`;
  totalErrors.textContent = `Total score = ${mistakes}/${81 - numberOfClues}${
    mistakes === 0
      ? " You're a genius...(or really luck)!"
      : mistakes > 9
      ? " Idiot, or unlucky you decide"
      : ""
  }`;
  dataCells.forEach((el) => el.classList.remove("hover", "hold"));
  modal.classList.remove("hide");
  overlay.classList.remove("hide");
}

function startStopTimer(startOrStop) {
  if (startOrStop === "start" && !timerRunning) {
    timer.classList.remove("hide");
    timerRunning = setInterval(() => {
      seconds++;
      if (seconds === 60) {
        seconds = 0;
        minutes++;
      }
      timer.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${
        seconds < 10 ? "0" + seconds : seconds
      }`;
    }, 1000);
  } else if (startOrStop === "stop" && timerRunning) {
    timer.classList.add("hide");
    clearInterval(timerRunning);
  }
}

function generateFullBoard() {
  const board = Array(81).fill(0);

  function isSafe(index, num) {
    const row = getRow(index);
    const col = getCol(index);

    for (let i = 0; i < 9; i++) {
      const r = row * 9 + i;
      const c = i * 9 + col;
      const b =
        3 * Math.floor(row / 3) * 9 +
        3 * Math.floor(col / 3) +
        (i % 3) +
        9 * Math.floor(i / 3);
      if (board[r] === num || board[c] === num || board[b] === num)
        return false;
    }

    return true;
  }

  function fill(index = 0) {
    if (index === 81) return true;

    const nums = [...Array(9)]
      .map((_, i) => i + 1)
      .sort(() => Math.random() - 0.5);

    for (const num of nums) {
      if (isSafe(index, num)) {
        board[index] = num;
        if (fill(index + 1)) return true;
        board[index] = 0;
      }
    }
    return false;
  }

  fill();
  return board;
}

function setCellValue() {
  const cellValues = generateFullBoard();
  dataCells.forEach((cell, index) => {
    cell.setAttribute("data-set", cellValues[index]);
  });
  return;
}

function fillCells(arr, difficulty) {
  const clueRange = {
    easy: [36, 49],
    medium: [32, 35],
    hard: [28, 31],
    expert: [17, 27],
  };
  const [min, max] = clueRange[difficulty];

  const clueCount = Math.floor(Math.random() * (max - min - 1)) + min;
  numberOfClues = clueCount;

  const filled = [];

  for (let i = 0; i < clueCount; i++) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const value = Number(arr[randomIndex].getAttribute("data-set"));
    const counter = document.getElementById(`counter-${value}`);
    if (!filled.includes(randomIndex)) {
      arr[randomIndex].textContent = value;
      filled.push(randomIndex);
      counter.textContent = Number(counter.textContent) - 1;
      if (Number(counter.textContent) === 0) {
        document.getElementById(`card-${value}`).style.display = "none";
      }
    } else {
      i--;
    }
  }
  return;
}

function startGame(arr, difficulty) {
  resetDifficulty = difficulty;
  if (gameboard.classList.contains("hide")) {
    main.classList.add("hide");
    gameboard.classList.remove("hide");
    selector.classList.remove("hide");
  }
  setCellValue();
  startStopTimer("start");
  fillCells(arr, difficulty);
}

function playAgain() {
  modal.classList.add("hide");
  overlay.classList.add("hide");
  dataCells.forEach((el) => el.removeAttribute("data-set"));
  const cards = [...selector.children];
  cards.forEach((card) => (card.style.display = "block"));
  [...document.querySelectorAll(".counter")].array.forEach((el) => {
    el.textContent = 9;
  });
  startGame(dataCells, resetDifficulty);
}

function backToMenu() {
  modal.classList.add("hide");
  overlay.classList.add("hide");
  gameboard.classList.add("hide");
  selector.classList.add("hide");
  main.classList.remove("hide");
  const cards = [...selector.children];
  cards.forEach((card) => (card.style.display = "block"));
  dataCells.forEach((el) => {
    el.textContent = "";
    el.removeAttribute("data-set");
  });
}

inputs.forEach((input, index) => {
  input.addEventListener("change", (e) => {
    const value = Number(input.value);
    handleInput(index, value);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" || e.key === "Tab") {
      return;
    } else if (!Number(e.key)) {
      e.preventDefault();
    }
    if (input.value !== "" && Number(e.key)) {
      input.value = e.key;
    }
  });
  input.addEventListener("paste", (e) => e.preventDefault());
});

easy.addEventListener("click", () => {
  startGame(dataCells, "easy");
});

medium.addEventListener("click", () => {
  startGame(dataCells, "medium");
});

hard.addEventListener("click", () => {
  startGame(dataCells, "hard");
});

expert.addEventListener("click", () => {
  startGame(dataCells, "expert");
});

let isClicked = false;

dataCells.forEach((div) => {
  div.addEventListener("mouseover", () => {
    const number = div.textContent;
    const some = [...dataCells].some((el) => el.classList.contains("hold"));
    if (!div.classList.contains("hover") && number !== "" && !some) {
      dataCells.forEach((el) =>
        el.textContent === number ? el.classList.add("hover") : null
      );
    } else {
      return;
    }
  });
  div.addEventListener("mouseout", () => {
    const number = div.textContent;
    if (number !== "") {
      dataCells.forEach((el) =>
        el.textContent === number ? el.classList.remove("hover") : null
      );
    } else {
      return;
    }
  });

  div.addEventListener("mousedown", () => {
    const number = div.textContent;

    if (!div.classList.contains("hold") && number !== "" && !isClicked) {
      isClicked = !isClicked;
      dataCells.forEach((el) =>
        el.textContent === number ? el.classList.add("hold") : null
      );
    } else if (number !== "" && div.classList.contains("hold")) {
      isClicked = !isClicked;
      dataCells.forEach((el) =>
        el.textContent === number ? el.classList.remove("hold") : null
      );
    } else if (isClicked && number !== "") {
      dataCells.forEach((el) => {
        el.classList.remove("hold");
        el.textContent === number ? el.classList.add("hold") : null;
      });
    } else {
      return;
    }
  });
});

playAgainBtn.addEventListener("click", playAgain);

backToMenuBtn.addEventListener("click", backToMenu);

/* Add selectors for timer reset button and modal
    Add timer functionality in MM:SS format
    Add a showModal function;
    Add a resetGame function;
**/

const main = document.getElementById("main");
const gameboard = document.getElementById("gameboard");
const selector = document.querySelector(".selector");
const easy = document.getElementById("easy");
const medium = document.getElementById("medium");
const hard = document.getElementById("hard");
const expert = document.getElementById("expert");

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

  if (![...dataCells].some((div) => div.children.length > 0)) {
    //Add a Show Modal, to show reset game, # of errors and game length
  }

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
      selector.removeChild(card);
    }
    return;
  } else {
    dataCells[index].classList.add("invalid");
  }
}

function generateFullBoard() {
  const board = Array(81).fill(0);

  function isSafe(index, num) {
    const row = getRow(index);
    const col = getCol(index);
    const box = getBox(row, col);

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

setCellValue();

function fillCells(arr, difficulty) {
  const clueRange = {
    easy: [36, 49],
    medium: [32, 35],
    hard: [28, 31],
    expert: [17, 27],
  };
  const [min, max] = clueRange[difficulty];

  const clueCount = Math.floor(Math.random() * (max - min - 1)) + min;

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
        selector.removeChild(`card-${value}`);
      }
    } else {
      i--;
    }
  }
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
  main.classList.add("hide");
  gameboard.classList.remove("hide");
  fillCells(dataCells, "easy");
});

medium.addEventListener("click", () => {
  main.classList.add("hide");
  gameboard.classList.remove("hide");
  fillCells(dataCells, "medium");
});

hard.addEventListener("click", () => {
  main.classList.add("hide");
  gameboard.classList.remove("hide");
  fillCells(dataCells, "hard");
});

expert.addEventListener("click", () => {
  main.classList.add("hide");
  gameboard.classList.remove("hide");
  fillCells(dataCells, "expert");
});

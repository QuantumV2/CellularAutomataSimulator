/*const width = 100; // Width of the 2D grid
const height = 100; // Height of the 2D grid*/
// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
let rule = urlParams.get('rule')?.split('-').map(Number) || [0,1,1,0,1,1,1,0]; // Rule for cell transitions
let randomrules = urlParams.get('randomrules')?.toLowerCase() === "true" || false;
let randomplace = urlParams.get('randomplace')?.toLowerCase() === "true" || false;
let size = parseInt(urlParams.get('size')) || 100;
//const rule = [0,1,1,0,1,1,1,0];
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cellSize = 10;

updateUrl();

canvas.width = size * cellSize;
canvas.height = size * cellSize;

const width = size;
const height = size;

if (randomrules) {
  rule = getRandomArray().join("-");
  updateUrl();
  randomrules = false;
}

// Create a 2D grid
let grid = [];
for (let i = 0; i < height; i++) {
  grid[i] = [];
  for (let j = 0; j < width; j++) {
    grid[i][j] = 0; // Initialize all cells to 0 (dead)
  }
}

const middleRow = Math.floor(height / 2);

if(randomplace)
{
// Set the initial state of the 1D automaton in the middle row
for (let j = 0; j < width; j++) {
  grid[middleRow][j] = Math.floor(Math.random() * 2); // Randomly set cells to 0 or 1
    }
}
else
{
// Set the initial state of the 1D automaton in the middle row
grid[0][middleRow] = 1; // Randomly set cells to 0 or 1
}
// Update the grid based on the 1D cellular automaton rules
for (let i = 1; i < height; i++) {
  for (let j = 1; j < width - 1; j++) {
    const left = grid[i - 1][j - 1];
    const center = grid[i - 1][j];
    const right = grid[i - 1][j + 1];
    const nextState = rule[(left << 2) | (center << 1) | right];
    grid[i][j] = nextState;
  }
}


function getRandomArray() {
  const binaryArray = [];
  for (let i = 0; i < 8; i++) {
    const bit = Math.floor(Math.random() * 2);
    binaryArray.push(bit);
  }
  return binaryArray;
}

function updateUrl() {
  
  urlParams.set('rule', rule.join('-'));
  if(urlParams.has('randomrules'))
  {
    urlParams.set('randomrules', false);
  }
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  history.pushState({}, '', newUrl);
}


for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    //console.log(grid[i].join(''));
    const cellState = grid[i][j];
    const x = j * cellSize;
    const y = i * cellSize;

    // Set cell color based on state
    ctx.fillStyle = cellState === 1 ? "black" : "white";
    ctx.fillRect(x, y, cellSize, cellSize);
  }
}

function download() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = (rule.join('-') + ".png");
  link.click();
}

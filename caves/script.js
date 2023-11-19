const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cellSize = 10;
const gridSize = Math.floor(canvas.width / cellSize);

let grid = createGrid();

function createGrid() {
  const grid = new Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = Math.random() > 0.5 ? 1 : 0;
    }
  }
  return grid;
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.fillStyle = grid[i][j] ? 'black' : 'white';
      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function updateGrid() {
  const newGrid = new Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = new Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      const neighbors = countNeighbors(i, j);
      if (grid[i][j] === 1) {
        newGrid[i][j] = neighbors >= 4 ? 1 : 0;
      } else {
        newGrid[i][j] = neighbors >= 5 ? 1 : 0;
      }
    }
  }
  grid = newGrid;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const neighborX = (x + i + gridSize) % gridSize;
      const neighborY = (y + j + gridSize) % gridSize;
      count += grid[neighborX][neighborY];
    }
  }
  return count;
}

// Event listener for mouse click to place or remove dots
canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = Math.floor((event.clientX - rect.left) / cellSize);
  const mouseY = Math.floor((event.clientY - rect.top) / cellSize);

  if (grid[mouseX][mouseY] === 0) {
    grid[mouseX][mouseY] = 1; // Set cell to alive
  } else {
    grid[mouseX][mouseY] = 0; // Set cell to dead
  }

  drawGrid();
});

function start()
{
  animate();
}
function animate() {
  setInterval(function(){
    updateGrid();
    drawGrid();
  }, 80);

}
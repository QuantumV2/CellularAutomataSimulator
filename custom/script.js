//const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const birthTextbox = document.getElementById("birthTextbox");
const surviveTextbox = document.getElementById("surviveTextbox");
const neighborhoodTextbox = document.getElementById("neighboring");
const refractoryTextbox = document.getElementById("refractoryTextbox");
const neighboringSizeTextbox = document.getElementById("neighboringSizeTextbox");
const neighborhoodPatternTextbox = document.getElementById("neighborhoodPatternTextbox");
const ctx = canvas.getContext('2d');
const cellSize = 10;

// Parse URL parameters and set to default value if not found
const urlParams = new URLSearchParams(window.location.search);
let birthRules = urlParams.get('birth')?.split('-').map(Number) || [3];
let surviveRules = urlParams.get('survive')?.split('-').map(Number) || [2, 3];
let randomize = urlParams.get('randomize')?.toLowerCase() === "true" || false;
let neighboring = parseInt(urlParams.get('neighboring')) || 0;
let neighboringSize = parseInt(urlParams.get('neighboringsize')) || 1;
let setCenter = urlParams.get('center')?.toLowerCase() === "true" || false;
let simSpeed = parseInt(urlParams.get('speed')) || 80;
let simInverted = urlParams.get('inverted')?.toLowerCase() === "true" || false;
let size = parseInt(urlParams.get('size')) || canvas.width;
let randomrules = urlParams.get('randomrules')?.toLowerCase() === "true" || false;
let refractoryPeriod = parseInt(urlParams.get('refractory')) || 0;
let randomRefractoryColor = urlParams.get('randrefractoryclr')?.toLowerCase() === "true" || false;
let randomColor = urlParams.get('randomcolor')?.toLowerCase() === "true" || false;
let wrap = urlParams.get('wrap')?.toLowerCase() !== "false";
let activeColor = urlParams.get('activecolor') || "000000";
let inactiveColor = urlParams.get('inactivecolor') || "FFFFFF";
let refractoryColor = urlParams.get('refractorycolor') || "000000";
let neighborhoodPattern = urlParams.get('neighborhoodPattern')?.split("-").map(subStr => subStr.split("_").map(Number)) || getRuleFromId(neighboring);
let oldNeighboring = false;
let isDrawing = false;
let prevCellX = -1;
let prevCellY = -1;


let randWhiteColor = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";
let randBlackColor = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";

//Since you cant have # in urls you need to do this 
activeColor = "#" + activeColor;
inactiveColor = "#" + inactiveColor;
refractoryColor = "#" + refractoryColor;

updateUrl();

if (randomColor) {
  randomRefractoryColor = true;
}

if (randomrules) {
  birthRules = getRandomArray(false);
  surviveRules = getRandomArray(true);
  refractoryPeriod = randomNumber(50);
  neighboring = randomNumber(3);
  neighboringSize = randomNumber(24)
  neighborhoodPattern = getRuleFromId(neighboring)
  updateUrl();
  
}



canvas.width = size;
canvas.height = size;

const gridSize = Math.floor(canvas.width / cellSize);

let grid = [];
grid = createGrid();

let paused = false;
let activated = false;

function createGrid() {
  const grid = [];
  for (let i = 0; i < gridSize; i++) {
    grid[i] = new Int8Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      if (i != gridSize / 2 && j != gridSize / 2 || !setCenter) {
        grid[i][j] = randomize ? (Math.random() > 0.5 ? 1 : 0) : 0;
      }
      else if (i == gridSize / 2 && j == gridSize / 2 && setCenter) {
        grid[i][j] = 1
      }
    }
  }
  return grid;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getRuleFromId(id)
{
  switch(id)
  {
    case 0:
      return calculateMoore(neighboringSize)
    case 1:
      return calculateSelfNeighborhood(neighboringSize)
    case 2:
      return calculateDiagonal(neighboringSize)
    case 3:
      return calculateVonNeumann(neighboringSize)
  }
}

function getRandomArray(includeZero) {
  var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  if (!includeZero) {
    arr = [1, 2, 3, 4, 5, 6, 7, 8];
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const randomSize = Math.floor(Math.random() * arr.length) + 1; // Ensure random size is at least 1
  return arr.slice(0, randomSize);
}


function normalize(val, min, max) {
  return (val - min) / (max - min);
}

function randomNumber(number) {
  return Math.floor(Math.random() * (number + 1))
}

function drawGrid() {
  // Set the background color to the inactive color (so refractory cells render properly)
  ctx.fillStyle = inactiveColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!randomColor) {
        ctx.fillStyle = simInverted ? (grid[i][j] ? inactiveColor : activeColor) : (grid[i][j] ? activeColor : inactiveColor);
      }
      else {
        ctx.fillStyle = simInverted ? (grid[i][j] ? randWhiteColor : randBlackColor) : (grid[i][j] ? randBlackColor : randWhiteColor);
      }
      if (grid[i][j] < 0 && !randomRefractoryColor) {
        var refractRGB = hexToRgb(refractoryColor);
        //Calculate transparency instead of the color since im lazy :)
        ctx.fillStyle = "rgba(" + refractRGB.r + ", " + refractRGB.g + ", " + refractRGB.b + ", " + normalize(grid[i][j], -refractoryPeriod - 1, 0) + ")";
      }
      else if (grid[i][j] < 0 && randomRefractoryColor) {
        ctx.fillStyle = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";
      }
      if (grid[i][j] > 1) {
        ctx.fillStyle = 'red';
      }
      if (grid[i][j] === undefined) {
        ctx.fillStyle = 'green';
      }
      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}


function updateGrid() {
  if (paused) { return; }
  const newGrid = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = new Int8Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      const neighbors = countNeighbors(i, j);


      //Check for neighboring and refractory

      if (grid[i][j] < 0) {
        newGrid[i][j] = grid[i][j] - 1;
        if (newGrid[i][j] <= -refractoryPeriod - 1) {
          newGrid[i][j] = 0;
        }
      } else if (grid[i][j] === 1) {
        newGrid[i][j] = surviveRules.includes(neighbors) ? 1 : (refractoryPeriod !== 0 ? -1 : 0);
      } else if (grid[i][j] === 0) {
        newGrid[i][j] = birthRules.includes(neighbors) ? 1 : 0;
      }

      //Failsafe for if they somehow get undefined idk how
      if(newGrid[i][j] === undefined)
      {
        newGrid[i][j] = 0;
      }
    }
  }
  grid = newGrid;
}

function countNeighbors(x, y) {
  let count = 0;

  for (let i = -neighboringSize; i <= neighboringSize; i++) {
    for (let j = -neighboringSize; j <= neighboringSize; j++) {

      let neighborX = x + i;
      let neighborY = y + j;

      //Check if wrap is true, if it isnt, then wrap the cells around like normal
      if (!wrap) {
        if (neighborX < 0 || neighborX >= gridSize || neighborY < 0 || neighborY >= gridSize) {
          continue;
        }
      } else {
        neighborX = (neighborX + gridSize) % gridSize;
        neighborY = (neighborY + gridSize) % gridSize;
      }

      //Check if the neighbor is valid with the current pattern
      if (neighborhoodPattern[clamp(j + 1, 0, neighborhoodPattern.length)][clamp(i + 1, 0, neighborhoodPattern.length)] != 0) {
        count += grid[neighborX][neighborY] == 1;
      }
    }
  }

  return count;
}

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

function calculateMoore(size)
{
  var resultArray = new Array((size * 2) + 1).fill(0).map(() => new Array((size * 2) + 1).fill(1));
  resultArray[size][size] = 0;  // Setting the central cell to 0
  return resultArray;
}

function calculateSelfNeighborhood(size) {
  var resultArray = new Array((size * 2) + 1).fill(0).map(() => new Array((size * 2) + 1).fill(1));
  return resultArray;
}

function calculateDiagonal(size) {
  var resultArray = new Array((size * 2) + 1).fill(0).map(() => new Array((size * 2) + 1).fill(1));
  resultArray[0][0] = 0;
  resultArray[size][size] = 0; // Setting the central cell to 0
  resultArray[(size * 2)][(size * 2)] = 0;
  return resultArray;
}

function calculateVonNeumann(size) {
  const resultArray = new Array((size * 2) + 1).fill(0).map(() => new Array((size * 2) + 1).fill(0));

  for (let i = 0; i <= size * 2; i++) {
    for (let j = 0; j <= size * 2; j++) {
      if (Math.abs(i - size) + Math.abs(j - size) <= size) {
        resultArray[i][j] = 1;
      }
    }
  }

  resultArray[size][size] = 0; // Setting the central cell to 0

  return resultArray;
}


function updateNeighboring()
{

  switch (neighboring) {
    case 0:
      neighborhoodPattern = calculateMoore(neighboringSize);
      break;

    case 1:
      neighborhoodPattern = calculateSelfNeighborhood(neighboringSize);
      break;

    case 2:
      neighborhoodPattern = calculateDiagonal(neighboringSize);
      break;

    case 3:
      neighborhoodPattern = calculateVonNeumann(neighboringSize);
      break;
  }
}

function updateUrl() {
  if ("0dfe31649926746499974e95ebed4565" === md5(birthTextbox.value)) { return; }
  urlParams.set('birth', birthRules.join('-'));
  urlParams.set('survive', surviveRules.join('-'));
  urlParams.set('refractory', refractoryPeriod);
  urlParams.set('neighboring', neighboring);
  urlParams.set('wrap', wrap);
  urlParams.set('neighborhoodPattern', neighborhoodPattern.join("-").replaceAll(",", "_"));
  urlParams.set('neighboringsize', neighboringSize);
  birthTextbox.value = birthRules.join(',');
  surviveTextbox.value = surviveRules.join(',');
  neighborhoodTextbox.value = "" + neighboring;
  neighborhoodPatternTextbox.value = neighborhoodPattern.join("-").replaceAll(",", "_");
  refractoryTextbox.value = refractoryPeriod;
  neighboringSizeTextbox.value = neighboringSize;
  document.getElementById('color-picker').value = activeColor;
  document.getElementById('color-picker1').value = inactiveColor;
  document.getElementById('color-picker2').value = refractoryColor;
  if(urlParams.has('randomrules'))
  {
    urlParams.set('randomrules', false);
  }
  urlParams.set('activecolor', activeColor.replace("#", ""));
  urlParams.set('inactivecolor', inactiveColor.replace("#", ""));
  urlParams.set('refractorycolor', refractoryColor.replace("#", ""));
  
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  history.pushState({}, '', newUrl);
}

birthTextbox.addEventListener("change", (event) => {
  birthRules = event.target.value.split(",").map(Number);
  updateUrl();
});
surviveTextbox.addEventListener("change", (event) => {
  surviveRules = event.target.value.split(",").map(Number);
  updateUrl();
});
neighborhoodTextbox.addEventListener('change', function() {
  neighboring = parseInt(this.value);
  updateNeighboring();
  updateUrl();
  
});
neighboringSizeTextbox.addEventListener('change', function() {
  neighboringSize = this.value;
  updateNeighboring();
  updateUrl();
});
refractoryTextbox.addEventListener('change', function() {
  refractoryPeriod = this.value;
  updateUrl();
});
neighborhoodPatternTextbox.addEventListener('change', function () {
  neighborhoodPattern = this.value?.split("-").map(subStr => subStr.split("_").map(Number));
  updateUrl();
});

canvas.addEventListener('mousedown', function (event) {
  isDrawing = true;
  handleDrawing(event);
});

canvas.addEventListener('mousemove', function (event) {
  if (isDrawing) {
    handleDrawing(event);
  }
});

canvas.addEventListener('mouseup', function (event) {
  isDrawing = false;
  prevCellX = -1;
  prevCellY = -1;
});

canvas.addEventListener('mouseleave', function (event) {
  isDrawing = false;
});

function handleDrawing(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = Math.floor((event.clientX - rect.left) / cellSize);
  const mouseY = Math.floor((event.clientY - rect.top) / cellSize);

  if (mouseX !== prevCellX || mouseY !== prevCellY) {
    if (prevCellX !== -1 && prevCellY !== -1) {
      drawLine(prevCellX, prevCellY, mouseX, mouseY);
    }
    placeCell(mouseX, mouseY);
    prevCellX = mouseX;
    prevCellY = mouseY;
    drawGrid();
  }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function drawLine(x0, y0, x1, y1) {
  if(refractoryPeriod === 0)
  {
    placeCell(x0, y0);
    placeCell(x1, y1);
  }
  else
  {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
      placeCell(x0, y0);
    }
  }
}

function placeCell(x, y) {
  if (refractoryPeriod !== 0) {
    if (grid[x][y] === 0) {
      grid[x][y] = 1; // Set cell to alive

    } else if (grid[x][y] === 1) {
      grid[x][y] = -1; // Set cell to -1 if active

    } else if (grid[x][y] < 0) {
      grid[x][y] -= 1; // Subtract one if negative

    } if (grid[x][y] <= -refractoryPeriod - 1) {
      grid[x][y] = 0;
    }
  }
  else {
    if (grid[x][y] === 0) {
      grid[x][y] = 1;

    } else if (grid[x][y] === 1) {
      grid[x][y] = 0;

    }
  }
}


document.getElementById('color-picker').addEventListener('change', function (event) {
  activeColor = event.target.value;
  updateUrl();
});
document.getElementById('color-picker1').addEventListener('change', function (event) {
  inactiveColor = event.target.value;
  updateUrl();
});
document.getElementById('color-picker2').addEventListener('change', function (event) {
  refractoryColor = event.target.value;
  updateUrl();
});

function download() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = (birthRules.join('-') || "3") + "_" + (surviveRules.join('-') || "2-3") + "_" + (refractoryPeriod || "0") + "_" + (neighboring || "0") + "_" + (neighboringSize || "1") + ".png";
  link.click();
}


function start() {
  animate();
}

function pause() {
  paused = !paused
}

function animate() {
  if (activated) { return; }
  activated = true;
  setInterval(function() {
    updateGrid();
    drawGrid();
  }, simSpeed);

}

drawGrid();

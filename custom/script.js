//const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const birthTextbox = document.getElementById("birthTextbox");
const surviveTextbox = document.getElementById("surviveTextbox");
const neighborhoodTextbox = document.getElementById("neighboring");
const refractoryTextbox = document.getElementById("refractoryTextbox");
const neighboringSizeTextbox = document.getElementById("neighboringSizeTextbox");
const ctx = canvas.getContext('2d');
const cellSize = 10;

// Parse URL parameters
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
let starwarsRuleset = urlParams.get('starwars')?.toLowerCase() === "true" || false;
let isDrawing = false;
let prevCellX = -1;
let prevCellY = -1;


updateUrl();


let randWhiteColor = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";
let randBlackColor = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";


if (randomColor) {
  randomRefractoryColor = true;
}

/*for (const param of urlParams) {
  console.log(param);
}
console.log(birthRules);
console.log(surviveRules);*/

if (randomrules) {
  birthRules = getRandomArray(false);
  surviveRules = getRandomArray(true);
  refractoryPeriod = randomNumber(50);
  neighboring = randomNumber(3);
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
  const grid = new Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize);
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
  // Set the background color to white
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!randomColor) {
        ctx.fillStyle = simInverted ? (grid[i][j] ? 'white' : 'black') : (grid[i][j] ? 'black' : 'white');
      }
      else {
        ctx.fillStyle = simInverted ? (grid[i][j] ? randWhiteColor : randBlackColor) : (grid[i][j] ? randBlackColor : randWhiteColor);
      }
      if (grid[i][j] < 0 && !randomRefractoryColor) {
        ctx.fillStyle = "rgba(0, 0, 0, " + normalize(grid[i][j], -refractoryPeriod - 1, 0) + ")";
      }
      else if (grid[i][j] < 0 && randomRefractoryColor) {
        ctx.fillStyle = "rgba(" + randomNumber(255) + ", " + randomNumber(255) + ", " + randomNumber(255) + ", 1)";
      }
      if (grid[i][j] > 1) {
        ctx.fillStyle = 'red';
      }
      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}


function updateGrid() {
  if (paused) { return; }
  const newGrid = new Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = new Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      //if (grid[i][j] < 0) { break; }
      const neighbors = countNeighbors(i, j);

      if (grid[i][j] < 0) {
        newGrid[i][j] = grid[i][j] - 1; // Decrease refractory period for cells with refractory period
        if (newGrid[i][j] <= -refractoryPeriod - 1) {
          newGrid[i][j] = 0; // Reset cell to 0 if it exceeds the limit
        }
      } else if (grid[i][j] === 1) {
        newGrid[i][j] = surviveRules.includes(neighbors) ? 1 : (refractoryPeriod !== 0 ? -1 : 0);
      } else if (grid[i][j] === 0) {
        newGrid[i][j] = birthRules.includes(neighbors) ? 1 : 0;
      }
    }
  }
  grid = newGrid;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -neighboringSize; i <= neighboringSize; i++) {
    for (let j = -neighboringSize; j <= neighboringSize; j++) {
      if (i === 0 && j === 0 && neighboring !== 1) continue;
      if (i === j && neighboring === 2) continue;
      if (Math.abs(i) + Math.abs(j) > neighboringSize && neighboring === 3) continue; // Neumann neighboring
      const neighborX = (x + i + gridSize) % gridSize;
      const neighborY = (y + j + gridSize) % gridSize;
      count += grid[neighborX][neighborY] === 1;
    }
  }
  return count;
}

function updateUrl() {
  
  urlParams.set('birth', birthRules.join('-'));
  urlParams.set('survive', surviveRules.join('-'));
  urlParams.set('refractory', refractoryPeriod);
  urlParams.set('neighboring', neighboring);
  urlParams.set('neighborsize', neighboringSize);
  birthTextbox.value = birthRules.join(',');
  surviveTextbox.value = surviveRules.join(',');
  neighborhoodTextbox.value = "" + neighboring;
  refractoryTextbox.value = refractoryPeriod;
  neighboringSizeTextbox.value = neighboringSize
  if(urlParams.has('randomrules'))
  {
    urlParams.set('randomrules', false);
  }
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
  updateUrl();
});
neighboringSizeTextbox.addEventListener('change', function() {
  neighboringSize = this.value;
  updateUrl();
});
refractoryTextbox.addEventListener('change', function() {
  refractoryPeriod = this.value;
  updateUrl();
});


canvas.addEventListener('mousedown', function(event) {
  isDrawing = true;
  handleDrawing(event);
});

canvas.addEventListener('mousemove', function(event) {
  if (isDrawing) {
    handleDrawing(event);
  }
});

canvas.addEventListener('mouseup', function(event) {
  isDrawing = false;
  prevCellX = -1;
  prevCellY = -1;
});

canvas.addEventListener('mouseleave', function(event) {
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

function drawLine(x0, y0, x1, y1) {
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

function placeCell(x, y) {
  if(refractoryPeriod !== 0)
  {
    if (grid[x][y] === 0) {
      grid[x][y] = 1; // Set cell to alive

    } else if (grid[x][y] === 1) {
      grid[x][y] = -1; // Set cell to -1 if active

    } else if (grid[x][y] < 0) {
      grid[x][y] -= 1; // Subtract one if negative

    } if (grid[x][y] <= -refractoryPeriod - 1) {
      grid[x][y] = 0; // Reset cell to 0 if it exceeds the limit
    }
  }
  else
  {
      if (grid[x][y] === 0) {
        grid[x][y] = 1; // Set cell to alive

      } else if (grid[x][y] === 1) {
        grid[x][y] = 0; // Set cell to dead

      }
  }
  //console.log(x, y, grid[x][y]);
  drawGrid();
}

function download() {
  /*const scaledCanvas = document.createElement("canvas");
  const scale = cellSize; // Adjust the scale factor as needed
  const ctx = scaledCanvas.getContext("2d");

  scaledCanvas.width = canvas.width / scale;
  scaledCanvas.height = canvas.height / scale;
  ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
*/
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = (birthRules.join('-') || "3") + "_" + (surviveRules.join('-') || "2-3") + "_" + (refractoryPeriod || "0") + "_" + (neighboring || "0") + "_" + (neighboringSize || "1") + ".png";
  link.click();
}

/*imageUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const image = new Image();
    image.onload = function() {
      canvas.width = image.width * cellSize;
      canvas.height = image.height * cellSize;
      //ctx.drawImage(image, 0, 0, image.width * cellSize);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelData = imageData.data;
      const binaryArray = [];

      for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const alpha = pixelData[i + 3];

        // Convert pixel to binary based on alpha value
        const binaryValue = r < 3 ? 0 : 1;
        binaryArray.push(binaryValue);
      }
      grid = JSON.parse(JSON.stringify(binaryArray));
      drawGrid();
      console.log(binaryArray);
    };
    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
});*/

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

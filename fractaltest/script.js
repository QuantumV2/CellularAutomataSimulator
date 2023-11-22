const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const xmin = -2.5;
const xmax = 1;
const ymin = -1;
const ymax = 1;

function drawMandelbrot() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let a = map(x, 0, width, xmin, xmax);
      let b = map(y, 0, height, ymin, ymax);

      let ca = a;
      let cb = b;
      let n = 0;

      while (n < 100) {
        const aa = a * a - b * b;
        const bb = 2 * a * b;
        a = aa + ca;
        b = bb + cb;

        if (a * a + b * b > 16) {
          break;
        }

        n++;
      }

      const brightness = map(n, 0, 100, 0, 255);
      const color = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Example usage
drawMandelbrot();
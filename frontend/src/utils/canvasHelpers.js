/**
 * Canvas utility functions for SignForge signature drawing and processing.
 */

/**
 * Draws a smooth line through an array of {x, y} points using quadratic
 * bezier curves. Prevents jaggy/pixelated strokes.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number}>} points
 * @param {string} color
 * @param {number} lineWidth
 */
export function drawSmoothLine(ctx, points, color, lineWidth) {
  if (!points || points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    // Draw the last segment as a straight line to the final point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Convert RGB values to HSV.
 * @returns {{ h: number, s: number, v: number }} h in [0,360], s and v in [0,100]
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h, s, v };
}

/**
 * Extracts blue ink pixels from an ImageData object. Non-blue pixels are set
 * to transparent, preserving only blue ink content.
 *
 * @param {ImageData} imageData
 * @param {number} [tolerance=50] — 0-100, higher keeps more borderline blue pixels
 * @returns {ImageData}
 */
export function extractBlueInk(imageData, tolerance = 50) {
  const data = new Uint8ClampedArray(imageData.data);
  const hueMin = 200;
  const hueMax = 260;

  // Tolerance widens the acceptable saturation and value range
  const satThreshold = Math.max(5, 30 - tolerance * 0.3);
  const valThreshold = Math.max(5, 20 - tolerance * 0.2);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const { h, s, v } = rgbToHsv(r, g, b);

    const isBlue = h >= hueMin && h <= hueMax && s >= satThreshold && v >= valThreshold;

    if (!isBlue) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Removes near-white background pixels by setting them to transparent.
 *
 * @param {ImageData} imageData
 * @param {number} [threshold=240] — 0-255, pixels with r/g/b all above this become transparent
 * @returns {ImageData}
 */
export function removeBackground(imageData, threshold = 240) {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > threshold && g > threshold && b > threshold) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Converts a canvas element to a Blob.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} [type='image/png']
 * @param {number} [quality=1]
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, type = 'image/png', quality = 1) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob returned null'));
        }
      },
      type,
      quality,
    );
  });
}

/**
 * Downloads the canvas content as a PNG file.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} [filename='signforge_signature.png']
 */
export function downloadCanvasAsPNG(canvas, filename = 'signforge_signature.png') {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

import { useState, useCallback, useRef } from 'react';
import { drawSmoothLine } from '../utils/canvasHelpers';

const INK_COLOR = '#1a3a8a';
const BASE_LINE_WIDTH = 2.5;

/**
 * Extract client coordinates from a mouse or touch event.
 */
function getEventCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();

  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }

  if (e.changedTouches && e.changedTouches.length > 0) {
    return {
      x: e.changedTouches[0].clientX - rect.left,
      y: e.changedTouches[0].clientY - rect.top,
    };
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

/**
 * Compute a line width that varies slightly based on drawing speed,
 * simulating pen pressure.
 */
function getLineWidthFromSpeed(prev, current) {
  if (!prev) return BASE_LINE_WIDTH;

  const dx = current.x - prev.x;
  const dy = current.y - prev.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Faster strokes produce thinner lines, slower strokes are thicker
  const speed = Math.min(distance, 50);
  const widthVariation = 1 - speed / 100; // range: 0.5 – 1.0
  return BASE_LINE_WIDTH * Math.max(0.6, widthVariation);
}

/**
 * Redraws all completed strokes onto the canvas.
 */
function redrawAllStrokes(canvas, strokes) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of strokes) {
    drawSmoothLine(ctx, stroke, INK_COLOR, BASE_LINE_WIDTH);
  }
}

/**
 * Custom React hook for managing canvas-based signature drawing.
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 */
export default function useSignatureCanvas(canvasRef) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]); // array of completed stroke arrays
  const currentStrokeRef = useRef([]);

  const startDrawing = useCallback(
    (e) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const coords = getEventCoords(e, canvas);
      currentStrokeRef.current = [coords];
      setIsDrawing(true);
    },
    [canvasRef],
  );

  const draw = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const coords = getEventCoords(e, canvas);
      const stroke = currentStrokeRef.current;
      const prevPoint = stroke.length > 0 ? stroke[stroke.length - 1] : null;
      const lineWidth = getLineWidthFromSpeed(prevPoint, coords);

      stroke.push(coords);

      // Draw the current stroke incrementally
      drawSmoothLine(ctx, stroke, INK_COLOR, lineWidth);
    },
    [isDrawing, canvasRef],
  );

  const stopDrawing = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (!isDrawing) return;

      const stroke = currentStrokeRef.current;
      if (stroke.length > 0) {
        setPoints((prev) => [...prev, [...stroke]]);
      }
      currentStrokeRef.current = [];
      setIsDrawing(false);
    },
    [isDrawing],
  );

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setPoints((prev) => {
      const next = prev.slice(0, -1);
      redrawAllStrokes(canvas, next);
      return next;
    });
    currentStrokeRef.current = [];
  }, [canvasRef]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    currentStrokeRef.current = [];
    setIsDrawing(false);
  }, [canvasRef]);

  const getCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, [canvasRef]);

  return {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    clear,
    getCanvasData,
    hasStrokes: points.length > 0,
  };
}

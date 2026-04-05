import { useRef, useEffect, useCallback } from "react";
import useSignatureCanvas from "../../hooks/useSignatureCanvas";
import { downloadCanvasAsPNG } from "../../utils/canvasHelpers";
import GlowButton from "../ui/GlowButton";
import GlassCard from "../ui/GlassCard";

const CANVAS_HEIGHT = 220;
const BASELINE_Y_RATIO = 0.75;

function drawBaseline(canvas) {
  const ctx = canvas.getContext("2d");
  // Use CSS display dimensions (not canvas.width which includes DPR scaling)
  const displayWidth = parseInt(canvas.style.width) || canvas.width;
  const displayHeight = parseInt(canvas.style.height) || canvas.height;
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const y = Math.round(displayHeight * BASELINE_Y_RATIO) + 0.5;
  ctx.moveTo(0, y);
  ctx.lineTo(displayWidth, y);
  ctx.stroke();
  ctx.restore();
}

export default function DrawPad({ onSignatureReady }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const {
    startDrawing, draw, stopDrawing, undo, clear, getCanvasData, hasStrokes,
  } = useSignatureCanvas(canvasRef);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    canvas.width = displayWidth * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = CANVAS_HEIGHT + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    drawBaseline(canvas);
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  const handleStrokeEnd = useCallback((e) => {
    stopDrawing(e);
    requestAnimationFrame(() => {
      const data = getCanvasData();
      if (data) onSignatureReady?.(data);
    });
  }, [stopDrawing, getCanvasData, onSignatureReady]);

  const handleClear = useCallback(() => {
    clear();
    drawBaseline(canvasRef.current);
    onSignatureReady?.(null);
  }, [clear, onSignatureReady]);

  const handleUndo = useCallback(() => {
    undo();
    drawBaseline(canvasRef.current);
    requestAnimationFrame(() => {
      const data = getCanvasData();
      onSignatureReady?.(data);
    });
  }, [undo, getCanvasData, onSignatureReady]);

  return (
    <GlassCard animate={false}>
      <p style={{ fontSize: 13, color: "#8888AA", marginBottom: 16 }}>
        Draw your signature below using your mouse or touchpad
      </p>

      <div ref={containerRef} style={{ width: "100%" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#08080E", cursor: "crosshair",
            touchAction: "none",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={handleStrokeEnd}
          onMouseLeave={handleStrokeEnd}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={handleStrokeEnd}
          onTouchCancel={handleStrokeEnd}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <GlowButton variant="accent" size="sm" onClick={handleClear}>
          Clear
        </GlowButton>
        <GlowButton variant="primary" size="sm" onClick={handleUndo} disabled={!hasStrokes}>
          Undo
        </GlowButton>
        <GlowButton
          variant="success" size="sm"
          onClick={() => canvasRef.current && downloadCanvasAsPNG(canvasRef.current)}
          disabled={!hasStrokes}
        >
          Download PNG
        </GlowButton>
      </div>
    </GlassCard>
  );
}

import { useRef, useEffect, useState, useCallback } from "react";
import { downloadCanvasAsPNG } from "../../utils/canvasHelpers";
import GlowButton from "../ui/GlowButton";
import GlassCard from "../ui/GlassCard";

const CANVAS_HEIGHT = 180;
const INK_COLOR = "#1a3a8a";
const FONT_FAMILY = "Dancing Script";

function renderTypedSignature(canvas, text, fontSize) {
  const ctx = canvas.getContext("2d");
  const displayWidth = parseInt(canvas.style.width) || canvas.width;
  const displayHeight = parseInt(canvas.style.height) || canvas.height;
  ctx.clearRect(0, 0, displayWidth, displayHeight);
  if (!text.trim()) return;

  const font = `${fontSize}px '${FONT_FAMILY}', cursive`;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = displayWidth / 2;
  const y = displayHeight / 2;

  ctx.fillStyle = INK_COLOR;
  ctx.globalAlpha = 0.06;
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillText(text, x - 0.5, y + 0.5);
  ctx.fillText(text, x + 0.5, y - 0.5);

  ctx.globalAlpha = 1;
  ctx.fillText(text, x, y);
}

export default function TypeSignature({ onSignatureReady }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(48);

  const render = useCallback(() => {
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
    renderTypedSignature(canvas, text, fontSize);
    onSignatureReady?.(text.trim() ? canvas.toDataURL("image/png") : null);
  }, [text, fontSize, onSignatureReady]);

  useEffect(() => {
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [render]);

  return (
    <GlassCard animate={false}>
      <p style={{ fontSize: 13, color: "#8888AA", marginBottom: 16 }}>
        Type your name and it will render in a handwriting style
      </p>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your name..."
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12,
          fontSize: 16, background: "rgba(10,10,15,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#E8E8FF", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "rgba(108,99,255,0.4)"}
        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <span style={{ fontSize: 13, color: "#8888AA", whiteSpace: "nowrap" }}>
          Size: {fontSize}px
        </span>
        <input
          type="range" min={32} max={80} value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      <div ref={containerRef} style={{ width: "100%", marginTop: 16 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#08080E",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <GlowButton
          variant="success" size="sm"
          onClick={() => canvasRef.current && text.trim() && downloadCanvasAsPNG(canvasRef.current)}
          disabled={!text.trim()}
        >
          Download PNG
        </GlowButton>
      </div>
    </GlassCard>
  );
}

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  extractBlueInk,
  removeBackground,
  downloadCanvasAsPNG,
} from "../../utils/canvasHelpers";
import GlowButton from "../ui/GlowButton";
import GlassCard from "../ui/GlassCard";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function processImage(img, tolerance, shouldRemoveBg, extractedCanvas) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = img.naturalWidth;
  tempCanvas.height = img.naturalHeight;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(img, 0, 0);

  let imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  if (shouldRemoveBg) imageData = removeBackground(imageData);
  imageData = extractBlueInk(imageData, tolerance);

  extractedCanvas.width = tempCanvas.width;
  extractedCanvas.height = tempCanvas.height;
  const ctx = extractedCanvas.getContext("2d");
  ctx.clearRect(0, 0, extractedCanvas.width, extractedCanvas.height);
  ctx.putImageData(imageData, 0, 0);
  return extractedCanvas.toDataURL("image/png");
}

export default function UploadSignature({ onSignatureReady }) {
  const originalCanvasRef = useRef(null);
  const extractedCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [tolerance, setTolerance] = useState(50);
  const [removeBg, setRemoveBg] = useState(true);

  const runExtraction = useCallback(() => {
    const img = imgRef.current;
    const extractedCanvas = extractedCanvasRef.current;
    if (!img || !extractedCanvas) return;
    const dataUrl = processImage(img, tolerance, removeBg, extractedCanvas);
    onSignatureReady?.(dataUrl);
  }, [tolerance, removeBg, onSignatureReady]);

  useEffect(() => {
    if (hasImage) runExtraction();
  }, [tolerance, removeBg, hasImage, runExtraction]);

  const handleFile = useCallback(
    (file) => {
      if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imgRef.current = img;
          const origCanvas = originalCanvasRef.current;
          if (origCanvas) {
            origCanvas.width = img.naturalWidth;
            origCanvas.height = img.naturalHeight;
            origCanvas.getContext("2d").drawImage(img, 0, 0);
          }
          setHasImage(true);
          runExtraction();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    [runExtraction],
  );

  const handleDrop = useCallback(
    (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer?.files?.[0]); },
    [handleFile],
  );

  if (!hasImage) {
    return (
      <GlassCard animate={false}>
        <p style={{ fontSize: 13, color: "#8888AA", marginBottom: 16 }}>
          Upload a photo of your handwritten signature (blue ink on white paper works best)
        </p>
        <motion.div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onClick={() => fileInputRef.current?.click()}
          animate={{ borderColor: isDragging ? "rgba(108,99,255,0.6)" : "rgba(255,255,255,0.06)" }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, width: "100%", height: 200, borderRadius: 12,
            border: "2px dashed", cursor: "pointer",
            background: "rgba(10,10,15,0.3)", transition: "background 0.2s",
          }}
        >
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 36 }}
          >
            {"\uD83D\uDCF7"}
          </motion.div>
          <p style={{ color: "#8888AA", fontSize: 14 }}>
            {isDragging ? "Drop here..." : "Drag & drop, or click to browse"}
          </p>
          <p style={{ color: "rgba(136,136,170,0.4)", fontSize: 12 }}>PNG, JPG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard animate={false}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={{ display: "block", fontSize: 11, color: "rgba(136,136,170,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>
            Original
          </span>
          <canvas
            ref={originalCanvasRef}
            style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "#08080E" }}
          />
        </div>
        <div>
          <span style={{ display: "block", fontSize: 11, color: "rgba(136,136,170,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>
            Extracted
          </span>
          <canvas
            ref={extractedCanvasRef}
            style={{
              width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
              background: "repeating-conic-gradient(#15151f 0% 25%, #0d0d15 0% 50%) 0 0 / 14px 14px",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#8888AA", whiteSpace: "nowrap" }}>Tolerance: {tolerance}</span>
          <input
            type="range" min={0} max={100} value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button" role="switch" aria-checked={removeBg}
            onClick={() => setRemoveBg((v) => !v)}
            style={{
              position: "relative", width: 40, height: 22, borderRadius: 11, border: "none",
              background: removeBg ? "#6C63FF" : "rgba(255,255,255,0.1)", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <span style={{
              position: "absolute", top: 2, left: removeBg ? 20 : 2,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </button>
          <span style={{ fontSize: 13, color: "#8888AA" }}>Remove background</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <GlowButton
          variant="accent" size="sm"
          onClick={() => { setHasImage(false); imgRef.current = null; onSignatureReady?.(null); }}
        >
          Upload New
        </GlowButton>
        <GlowButton
          variant="success" size="sm"
          onClick={() => extractedCanvasRef.current && downloadCanvasAsPNG(extractedCanvasRef.current)}
        >
          Download PNG
        </GlowButton>
      </div>
    </GlassCard>
  );
}

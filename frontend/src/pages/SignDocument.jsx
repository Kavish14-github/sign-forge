import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import GlassCard from "../components/ui/GlassCard";
import GlowButton from "../components/ui/GlowButton";
import PDFViewer from "../components/document/PDFViewer";
import SignatureDragger from "../components/document/SignatureDragger";
import PageSelector from "../components/document/PageSelector";
import usePDFDocument from "../hooks/usePDFDocument";
import { embedSignatureInPDF, downloadPDF } from "../utils/renderPDF";

let nextSigId = 1;

export default function SignDocument() {
  const {
    pdfFile, pdfUrl, numPages, currentPage,
    setNumPages, loadPDF, setPage, getPdfBytes,
  } = usePDFDocument();

  useEffect(() => {
    document.title = "Sign PDF Online Free — Add Signature to PDF | SnapSign";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "Add your signature to any PDF document for free. Upload PDF, place signature, download signed document. No account, no server upload. 100% private."
    );
  }, []);

  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureBytes, setSignatureBytes] = useState(null);

  // Multi-signature state: array of placed signatures
  const [placedSignatures, setPlacedSignatures] = useState([]);
  const [selectedSigId, setSelectedSigId] = useState(null);

  const [isApplying, setIsApplying] = useState(false);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const viewerContainerRef = useRef(null);

  // Get the currently selected signature object
  const selectedSig = placedSignatures.find((s) => s.id === selectedSigId) || null;

  // Signatures visible on the current page
  const currentPageSignatures = placedSignatures.filter((s) => s.page === currentPage);

  const handlePdfDrop = useCallback((e) => {
    e.preventDefault(); setPdfDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type === "application/pdf") loadPDF(file);
    else toast.error("Please upload a valid PDF file.");
  }, [loadPDF]);

  const handlePdfFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") loadPDF(file);
    else if (file) toast.error("Please upload a valid PDF file.");
  }, [loadPDF]);

  const handleSignatureUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    setSignatureUrl(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (ev) => setSignatureBytes(new Uint8Array(ev.target.result));
    reader.readAsArrayBuffer(file);
  }, []);

  // Place a new signature on the current page
  const handlePlaceSignature = useCallback(() => {
    if (!signatureUrl || !signatureBytes) return toast.error("Upload a signature first.");
    if (!pdfUrl) return toast.error("Upload a PDF first.");
    const id = nextSigId++;
    const newSig = {
      id,
      page: currentPage,
      signatureUrl,
      signatureBytes,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 80 },
      opacity: 1,
      rotation: 0,
      scale: 1,
    };
    setPlacedSignatures((prev) => [...prev, newSig]);
    setSelectedSigId(id);
  }, [signatureUrl, signatureBytes, pdfUrl, currentPage]);

  // Update a specific placed signature
  const updateSignature = useCallback((id, updates) => {
    setPlacedSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  // Remove a placed signature
  const removeSignature = useCallback((id) => {
    setPlacedSignatures((prev) => prev.filter((s) => s.id !== id));
    setSelectedSigId((prev) => (prev === id ? null : prev));
  }, []);

  // Get effective size for a signature
  const getEffectiveSize = (sig) => ({
    width: sig.size.width * sig.scale,
    height: sig.size.height * sig.scale,
  });

  const handleApplyAndDownload = useCallback(async () => {
    const pdfBytes = getPdfBytes();
    if (!pdfBytes) return toast.error("Please upload a PDF first.");
    if (placedSignatures.length === 0) return toast.error("Place at least one signature first.");
    setIsApplying(true);
    try {
      const container = viewerContainerRef.current;
      if (!container) throw new Error("Viewer container not found");
      const pageCanvas = container.querySelector("canvas");
      if (!pageCanvas) throw new Error("PDF page not rendered yet");

      const { PDFDocument } = await import("pdf-lib");

      // The canvas displays the current page scaled to fit container width.
      // All pages are rendered at the same container width, so the display width
      // is always pageCanvas.clientWidth. The display height varies per page
      // but we can derive it: displayHeight = displayWidth * (pdfHeight / pdfWidth).
      // So scaleX = pdfWidth / displayWidth, scaleY = pdfHeight / displayHeight
      // which simplifies to scaleX = scaleY = pdfWidth / displayWidth.
      const displayWidth = pageCanvas.clientWidth;

      let modifiedBytes = pdfBytes;

      for (const sig of placedSignatures) {
        const effSize = getEffectiveSize(sig);
        const doc = await PDFDocument.load(modifiedBytes);
        const page = doc.getPages()[sig.page - 1];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();
        const scaleFactor = pdfWidth / displayWidth;
        const pdfX = sig.position.x * scaleFactor;
        const pdfY = pdfHeight - (sig.position.y + effSize.height) * scaleFactor;

        modifiedBytes = await embedSignatureInPDF(
          modifiedBytes, sig.signatureBytes, sig.page - 1,
          pdfX, pdfY, effSize.width * scaleFactor, effSize.height * scaleFactor,
          sig.opacity, sig.rotation,
        );
      }

      const name = pdfFile?.name?.replace(/\.pdf$/i, "") || "document";
      downloadPDF(modifiedBytes, `${name}_signed.pdf`);
      toast.success("File never left your device", { icon: "\uD83D\uDD12", duration: 4000 });
    } catch (err) {
      console.error("Apply failed:", err);
      toast.error("Failed to embed signature. Please try again.");
    } finally { setIsApplying(false); }
  }, [getPdfBytes, placedSignatures, pdfFile]);

  const sliderStyle = {
    width: "100%", accentColor: "#6C63FF", height: 4, cursor: "pointer",
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(108,99,255,0.6) 0%, transparent 70%)", top: "-10%", left: "-5%", opacity: 0.10 }}
          animate={{ x: [0, 60, -30, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(0,217,255,0.5) 0%, transparent 70%)", top: "30%", right: "-3%", opacity: 0.08 }}
          animate={{ x: [0, -40, 30, 0], y: [0, -50, 25, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, rgba(232,232,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <Navbar />

      <div style={{ position: "relative", zIndex: 1, width: "100%", paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Heading */}
          <motion.div
            style={{ textAlign: "center", marginBottom: 40 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: 12 }}>
              Sign Document
            </h1>
            <p style={{ color: "#8888AA", fontSize: 14 }}>
              Upload a PDF, place your signature, and download the signed document
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* ── Left Panel ── */}
            <div style={{ flex: "2 1 500px", minWidth: 0 }}>
              {!pdfUrl ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                  onDragLeave={() => setPdfDragOver(false)}
                  onDrop={handlePdfDrop}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 12, width: "100%", minHeight: 420, borderRadius: 16, cursor: "pointer",
                    border: `2px dashed ${pdfDragOver ? "rgba(108,99,255,0.6)" : "rgba(255,255,255,0.08)"}`,
                    background: pdfDragOver ? "rgba(108,99,255,0.06)" : "rgba(17,17,24,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  <input type="file" accept="application/pdf" onChange={handlePdfFileInput} style={{ display: "none" }} />
                  <div style={{ fontSize: 56, opacity: 0.4 }}>{"\uD83D\uDCC4"}</div>
                  <p style={{ color: "#E8E8FF", fontWeight: 500, fontSize: 16 }}>Drop your PDF here</p>
                  <p style={{ color: "#8888AA", fontSize: 13 }}>or click to browse</p>
                </label>
              ) : (
                <div
                  ref={viewerContainerRef}
                  style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}
                  onClick={(e) => {
                    // Deselect when clicking the PDF background (not a signature)
                    if (e.target === e.currentTarget || e.target.closest("[data-sig-id]") === null) {
                      setSelectedSigId(null);
                    }
                  }}
                >
                  <PDFViewer pdfUrl={pdfUrl} currentPage={currentPage} onDocumentLoadSuccess={({ numPages: n }) => setNumPages(n)} />
                  {currentPageSignatures.map((sig) => (
                    <SignatureDragger
                      key={sig.id}
                      sigId={sig.id}
                      signatureUrl={sig.signatureUrl}
                      position={sig.position}
                      size={getEffectiveSize(sig)}
                      opacity={sig.opacity}
                      rotation={sig.rotation}
                      isSelected={sig.id === selectedSigId}
                      onSelect={() => setSelectedSigId(sig.id)}
                      onPositionChange={(pos) => updateSignature(sig.id, { position: pos })}
                      onSizeChange={(s) => updateSignature(sig.id, { size: { width: s.width / sig.scale, height: s.height / sig.scale } })}
                      containerRef={viewerContainerRef}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right Panel ── */}
            <div style={{ flex: "1 1 320px", minWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Signature upload */}
              <GlassCard animate={false} style={{ padding: "28px 28px" }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: "#E8E8FF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                  Signature
                </h2>
                {signatureUrl ? (
                  <div>
                    <div style={{
                      background: "rgba(10,10,15,0.5)", borderRadius: 14, padding: 16,
                      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80,
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <img src={signatureUrl} alt="Signature" style={{ maxHeight: 64, maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                    <label style={{
                      display: "block", textAlign: "center", marginTop: 14, fontSize: 13,
                      color: "#8888AA", cursor: "pointer", textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}>
                      Change signature
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "32px 20px", borderRadius: 14,
                        border: "2px dashed rgba(255,255,255,0.08)",
                        cursor: "pointer", transition: "all 0.2s",
                        background: "rgba(10,10,15,0.2)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,217,255,0.25)"; e.currentTarget.style.background = "rgba(0,217,255,0.03)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(10,10,15,0.2)"; }}
                    >
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: "none" }} />
                      <span style={{ fontSize: 36, marginBottom: 10, opacity: 0.5 }}>{"\u270D\uFE0F"}</span>
                      <span style={{ color: "#E8E8FF", fontSize: 14, fontWeight: 500 }}>Upload signature image</span>
                      <span style={{ color: "#8888AA", fontSize: 12, marginTop: 4 }}>PNG, JPG accepted</span>
                    </label>
                    <Link
                      to="/create"
                      style={{
                        display: "block", textAlign: "center", marginTop: 14,
                        fontSize: 13, color: "#00D9FF", textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Create one first &rarr;
                    </Link>
                  </div>
                )}
              </GlassCard>

              {/* Page nav */}
              {pdfUrl && numPages > 0 && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <PageSelector currentPage={currentPage} numPages={numPages} onPageChange={setPage} />
                </div>
              )}

              {/* Place signature button */}
              {pdfUrl && signatureUrl && (
                <GlowButton
                  variant="primary"
                  size="lg"
                  onClick={handlePlaceSignature}
                  style={{ width: "100%" }}
                >
                  + Place Signature on Page {currentPage}
                </GlowButton>
              )}

              {/* Placed signatures list */}
              {placedSignatures.length > 0 && (
                <GlassCard animate={false} style={{ padding: "20px 28px" }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, color: "#E8E8FF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                    Placed Signatures ({placedSignatures.length})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {placedSignatures.map((sig, idx) => (
                      <div
                        key={sig.id}
                        onClick={() => { setSelectedSigId(sig.id); setPage(sig.page); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                          background: sig.id === selectedSigId ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${sig.id === selectedSigId ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={sig.signatureUrl} alt="" style={{ height: 24, maxWidth: 60, objectFit: "contain", opacity: 0.7 }} />
                          <span style={{ fontSize: 13, color: "#B0B0CC" }}>Page {sig.page}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#8888AA", fontSize: 16, padding: "2px 6px", borderRadius: 6,
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#8888AA"; }}
                          title="Remove signature"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Controls — only when a signature is selected */}
              {selectedSig && (
                <GlassCard animate={false} style={{ padding: "28px 28px" }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, color: "#E8E8FF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>
                    Adjust Selected Signature
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Opacity */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 14, color: "#B0B0CC", fontWeight: 500 }}>Opacity</span>
                        <span style={{
                          fontSize: 12, color: "#8888AA", fontFamily: "monospace",
                          background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6,
                        }}>
                          {Math.round(selectedSig.opacity * 100)}%
                        </span>
                      </div>
                      <input type="range" min={0} max={100} value={Math.round(selectedSig.opacity * 100)} onChange={(e) => updateSignature(selectedSigId, { opacity: Number(e.target.value) / 100 })} style={sliderStyle} />
                    </div>
                    {/* Rotation */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 14, color: "#B0B0CC", fontWeight: 500 }}>Rotation</span>
                        <span style={{
                          fontSize: 12, color: "#8888AA", fontFamily: "monospace",
                          background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6,
                        }}>
                          {selectedSig.rotation}&deg;
                        </span>
                      </div>
                      <input type="range" min={-180} max={180} value={selectedSig.rotation} onChange={(e) => updateSignature(selectedSigId, { rotation: Number(e.target.value) })} style={sliderStyle} />
                    </div>
                    {/* Scale */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 14, color: "#B0B0CC", fontWeight: 500 }}>Scale</span>
                        <span style={{
                          fontSize: 12, color: "#8888AA", fontFamily: "monospace",
                          background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6,
                        }}>
                          {Math.round(selectedSig.scale * 100)}%
                        </span>
                      </div>
                      <input type="range" min={25} max={200} value={Math.round(selectedSig.scale * 100)} onChange={(e) => updateSignature(selectedSigId, { scale: Number(e.target.value) / 100 })} style={sliderStyle} />
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

                    {/* Remove selected */}
                    <button
                      onClick={() => removeSignature(selectedSigId)}
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 12, fontSize: 14,
                        fontWeight: 500,
                        color: "#ff6b6b", background: "rgba(255,107,107,0.06)",
                        border: "1px solid rgba(255,107,107,0.15)", cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.12)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.06)"; }}
                    >
                      Remove This Signature
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* Apply button */}
              <GlowButton
                variant="primary"
                size="lg"
                onClick={handleApplyAndDownload}
                disabled={!pdfUrl || placedSignatures.length === 0 || isApplying}
                style={{ width: "100%" }}
              >
                {isApplying ? "Applying..." : `Download with ${placedSignatures.length} Signature${placedSignatures.length !== 1 ? "s" : ""}`}
              </GlowButton>

              {(!pdfUrl || !signatureUrl) && (
                <p style={{ fontSize: 13, color: "rgba(136,136,170,0.5)", textAlign: "center" }}>
                  {!pdfUrl && !signatureUrl ? "Upload a PDF and a signature to get started"
                    : !pdfUrl ? "Upload a PDF to continue" : "Upload a signature to continue"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </>
  );
}

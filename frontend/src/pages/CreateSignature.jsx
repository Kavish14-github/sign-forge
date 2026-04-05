import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DrawPad from "../components/signature/DrawPad";
import TypeSignature from "../components/signature/TypeSignature";
import UploadSignature from "../components/signature/UploadSignature";
import SignaturePreview from "../components/signature/SignaturePreview";

const TABS = [
  { id: "draw", label: "Draw", icon: "\u270F\uFE0F" },
  { id: "type", label: "Type", icon: "Aa" },
  { id: "upload", label: "Upload", icon: "\uD83D\uDCF7" },
];

export default function CreateSignature() {
  const [activeTab, setActiveTab] = useState("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);

  const handleSignatureReady = useCallback((dataUrl) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const handleDownload = useCallback(() => {
    if (!signatureDataUrl) return;
    const link = document.createElement("a");
    link.href = signatureDataUrl;
    link.download = "signforge_signature.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File never left your device", {
      iconTheme: { primary: "#00FF94", secondary: "#111118" },
    });
  }, [signatureDataUrl]);

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: 500, height: 500,
            background: "radial-gradient(circle, rgba(108,99,255,0.6) 0%, transparent 70%)",
            top: "-10%", right: "10%", opacity: 0.12,
          }}
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(0,217,255,0.5) 0%, transparent 70%)",
            bottom: "10%", left: "5%", opacity: 0.08,
          }}
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(232,232,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Navbar />

      {/* Main content — centered */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

          {/* Heading */}
          <motion.div
            style={{ textAlign: "center", marginBottom: 40 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: 12 }}>
              Create Your Signature
            </h1>
            <p style={{ color: "#8888AA", fontSize: 14 }}>
              Draw, type, or upload your signature — it never leaves your device
            </p>
          </motion.div>

          {/* Tab bar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                background: "rgba(17,17,24,0.6)",
                backdropFilter: "blur(20px)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: 4,
                gap: 2,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setSignatureDataUrl(null); }}
                  style={{
                    position: "relative",
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    color: activeTab === tab.id ? "#E8E8FF" : "#8888AA",
                    background: activeTab === tab.id ? "rgba(108,99,255,0.15)" : "transparent",
                    border: activeTab === tab.id ? "1px solid rgba(108,99,255,0.25)" : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "draw" && <DrawPad onSignatureReady={handleSignatureReady} />}
              {activeTab === "type" && <TypeSignature onSignatureReady={handleSignatureReady} />}
              {activeTab === "upload" && <UploadSignature onSignatureReady={handleSignatureReady} />}
            </motion.div>
          </AnimatePresence>

          {/* Preview */}
          <div style={{ marginTop: 32 }}>
            <SignaturePreview signatureDataUrl={signatureDataUrl} onDownload={handleDownload} />
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </>
  );
}

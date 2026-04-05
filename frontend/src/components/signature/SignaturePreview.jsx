import GlassCard from "../ui/GlassCard";
import GlowButton from "../ui/GlowButton";

export default function SignaturePreview({ signatureDataUrl, onDownload }) {
  return (
    <GlassCard animate={false}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: "#8888AA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Preview
        </h3>
        {signatureDataUrl && onDownload && (
          <GlowButton variant="success" size="sm" onClick={onDownload}>
            Download Signature
          </GlowButton>
        )}
      </div>

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
          background: signatureDataUrl
            ? "repeating-conic-gradient(#15151f 0% 25%, #0d0d15 0% 50%) 0 0 / 14px 14px"
            : "#08080E",
        }}
      >
        {signatureDataUrl ? (
          <img
            src={signatureDataUrl}
            alt="Signature preview"
            style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", padding: 20 }}
            draggable={false}
          />
        ) : (
          <p style={{ color: "rgba(136,136,170,0.3)", fontSize: 14, padding: "40px 0" }}>
            Create a signature above to preview
          </p>
        )}
      </div>
    </GlassCard>
  );
}

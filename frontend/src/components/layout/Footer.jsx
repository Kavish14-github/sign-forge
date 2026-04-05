export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, color: "#8888AA" }}>
        SignForge &mdash; Your signature. Your device. Always private.
      </p>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 11,
          color: "rgba(136,136,170,0.5)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6, height: 6,
            borderRadius: "50%",
            background: "rgba(0,255,148,0.6)",
          }}
        />
        Zero data collection &middot; No server &middot; No tracking
      </div>
    </footer>
  );
}

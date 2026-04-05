import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(10,10,15,0.70)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#E8E8FF",
            textDecoration: "none",
            textShadow: "0 0 24px rgba(108,99,255,0.3)",
          }}
        >
          SnapSign
        </Link>

        {/* Status — right corner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              width: 8,
              height: 8,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#00FF94",
                opacity: 0.4,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
            <span
              style={{
                position: "relative",
                display: "inline-flex",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00FF94",
              }}
            />
          </span>
          <span style={{ fontSize: 13, color: "#8888AA" }}>
            Local only
          </span>
        </div>
      </div>
    </nav>
  );
}

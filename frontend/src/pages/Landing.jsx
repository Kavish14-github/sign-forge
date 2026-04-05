import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import GlowButton from "../components/ui/GlowButton";


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: "\u{1F6E1}\uFE0F",
    title: "100% Private",
    desc: "Your files never leave your browser. All processing happens locally on your device.",
    color: "#6C63FF",
    colorAlpha: "rgba(108,99,255,",
  },
  {
    icon: "\u{1F4F4}",
    title: "Works Offline",
    desc: "After first load, SnapSign works completely offline. No internet required.",
    color: "#00D9FF",
    colorAlpha: "rgba(0,217,255,",
  },
  {
    icon: "\u2728",
    title: "No Watermarks",
    desc: "Download clean, professional documents. No watermarks, no branding, no catch.",
    color: "#00FF94",
    colorAlpha: "rgba(0,255,148,",
  },
];

const steps = [
  { num: 1, title: "Create your signature", desc: "Draw, type, or upload a photo of your signature" },
  { num: 2, title: "Upload your document", desc: "Load any PDF directly in your browser" },
  { num: 3, title: "Place & download", desc: "Position your signature and download the signed PDF" },
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SnapSign — Sign PDF Online Free | No Account, No Upload";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "Sign PDF documents for free directly in your browser. No account, no upload, no watermarks. Draw, type, or upload your signature. 100% private."
    );
  }, []);

  return (
    <>
      {/* ── Background layers (fixed, behind everything) ──── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: 700, height: 700,
            background: "radial-gradient(circle, rgba(108,99,255,0.6) 0%, transparent 70%)",
            top: "-20%", left: "10%", opacity: 0.15,
          }}
          animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(0,217,255,0.6) 0%, transparent 70%)",
            top: "30%", right: "0%", opacity: 0.12,
          }}
          animate={{ x: [0, -60, 50, 0], y: [0, -70, 40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: 500, height: 500,
            background: "radial-gradient(circle, rgba(0,255,148,0.5) 0%, transparent 70%)",
            bottom: "5%", left: "30%", opacity: 0.08,
          }}
          animate={{ x: [0, 50, -60, 0], y: [0, -40, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(232,232,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero — full viewport height, perfectly centered ── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          width: "100%", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 24px",
        }}
      >
        <motion.h1
          style={{
            fontSize: "clamp(3.5rem, 10vw, 8rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow: "0 0 80px rgba(108,99,255,0.3), 0 0 160px rgba(108,99,255,0.1)",
          }}
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          Snap<span style={{ color: "#6C63FF" }}>Sign</span>
        </motion.h1>

        <motion.p
          style={{
            marginTop: 24,
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            fontWeight: 600,
            color: "#00D9FF",
          }}
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          Your signature. Your device. Always private.
        </motion.p>

        <motion.p
          style={{
            marginTop: 20,
            maxWidth: 520,
            color: "#8888AA",
            fontSize: "1rem",
            lineHeight: 1.7,
          }}
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
        >
          A local-first document signing tool. No accounts, no servers, no
          watermarks. Everything happens in your browser.
        </motion.p>

        <motion.div
          style={{
            marginTop: 40,
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "center",
            gap: 16,
          }}
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
        >
          <GlowButton variant="primary" size="lg" onClick={() => navigate("/create")}>
            Create Signature
          </GlowButton>
          <GlowButton variant="accent" size="lg" onClick={() => navigate("/sign")}>
            Sign Document
          </GlowButton>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ marginTop: 64, color: "rgba(136,136,170,0.3)" }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          width: "100%", padding: "96px 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <motion.h2
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, textAlign: "center", marginBottom: 16 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why SnapSign?
        </motion.h2>
        <motion.p
          style={{ fontSize: 15, color: "#8888AA", textAlign: "center", marginBottom: 56, maxWidth: 480 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Built for people who care about privacy and simplicity.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            maxWidth: 1000,
            width: "100%",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{
                position: "relative",
                background: "rgba(17,17,24,0.6)",
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "40px 32px 36px",
                textAlign: "center",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.3s, transform 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${f.colorAlpha}0.25)`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top glow line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                  opacity: 0.5,
                }}
              />

              {/* Icon with glow background */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: `${f.colorAlpha}0.08)`,
                  border: `1px solid ${f.colorAlpha}0.15)`,
                  marginBottom: 24,
                  fontSize: 32,
                  boxShadow: `0 0 40px ${f.colorAlpha}0.12)`,
                }}
              >
                {f.icon}
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#E8E8FF", marginBottom: 12 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#8888AA", lineHeight: 1.8 }}>
                {f.desc}
              </p>

              {/* Bottom corner glow */}
              <div
                style={{
                  position: "absolute",
                  bottom: -60,
                  right: -60,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.colorAlpha}0.06) 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          width: "100%", padding: "96px 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <motion.h2
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, textAlign: "center", marginBottom: 64 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 48,
            maxWidth: 800,
            width: "100%",
          }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div
                style={{
                  width: 56, height: 56, borderRadius: "50%", marginBottom: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
                  color: "#6C63FF", fontSize: 20, fontWeight: 700,
                  boxShadow: "0 0 30px rgba(108,99,255,0.25)",
                }}
              >
                {s.num}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#E8E8FF", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "#8888AA", lineHeight: 1.7 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 1,
          width: "100%", padding: "80px 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: 16 }}>
            Ready to sign?
          </h2>
          <p style={{ color: "#8888AA", marginBottom: 32 }}>
            Get started in seconds. No signup required.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            <GlowButton variant="primary" size="lg" onClick={() => navigate("/create")}>
              Create Signature
            </GlowButton>
            <GlowButton variant="accent" size="lg" onClick={() => navigate("/sign")}>
              Sign Document
            </GlowButton>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </>
  );
}

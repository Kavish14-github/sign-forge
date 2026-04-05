import { motion } from "framer-motion";

const colorMap = {
  primary: {
    bg: "rgba(108,99,255,0.12)",
    bgHover: "rgba(108,99,255,0.22)",
    text: "#6C63FF",
    border: "rgba(108,99,255,0.3)",
    glow: "0 0 24px rgba(108,99,255,0.4), 0 0 48px rgba(108,99,255,0.15)",
  },
  accent: {
    bg: "rgba(0,217,255,0.10)",
    bgHover: "rgba(0,217,255,0.20)",
    text: "#00D9FF",
    border: "rgba(0,217,255,0.3)",
    glow: "0 0 24px rgba(0,217,255,0.4), 0 0 48px rgba(0,217,255,0.15)",
  },
  success: {
    bg: "rgba(0,255,148,0.10)",
    bgHover: "rgba(0,255,148,0.20)",
    text: "#00FF94",
    border: "rgba(0,255,148,0.3)",
    glow: "0 0 24px rgba(0,255,148,0.4), 0 0 48px rgba(0,255,148,0.15)",
  },
};

const sizeMap = {
  sm: { padding: "12px 24px", fontSize: 14, borderRadius: 10 },
  md: { padding: "14px 32px", fontSize: 15, borderRadius: 12 },
  lg: { padding: "18px 40px", fontSize: 17, borderRadius: 14 },
};

export default function GlowButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  style: extraStyle = {},
}) {
  const c = colorMap[variant] || colorMap.primary;
  const s = sizeMap[size] || sizeMap.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03, boxShadow: c.glow }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "0.01em",
        color: c.text,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: s.borderRadius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        filter: disabled ? "saturate(0)" : "none",
        transition: "background 0.2s, opacity 0.2s",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = c.bgHover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = c.bg; }}
    >
      {children}
    </motion.button>
  );
}

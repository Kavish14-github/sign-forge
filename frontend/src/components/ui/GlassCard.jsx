import { motion } from "framer-motion";

export default function GlassCard({
  children,
  animate = true,
  style: extraStyle = {},
}) {
  const Wrapper = animate ? motion.div : "div";

  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: "easeOut" },
      }
    : {};

  return (
    <Wrapper
      {...animateProps}
      style={{
        background: "rgba(17,17,24,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: "28px 28px",
        ...extraStyle,
      }}
    >
      {children}
    </Wrapper>
  );
}

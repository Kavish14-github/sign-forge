import { useState } from "react";

export default function TooltipHint({
  text,
  children,
  position = "top",
}) {
  const [visible, setVisible] = useState(false);

  const positionClasses =
    position === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`
            absolute z-50 ${positionClasses}
            px-3 py-1.5 rounded-md
            bg-bg border border-white/10
            text-xs text-txt-muted whitespace-nowrap
            pointer-events-none
            shadow-lg
          `}
        >
          {text}
        </div>
      )}
    </div>
  );
}

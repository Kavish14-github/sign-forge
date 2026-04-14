import { useState, useRef, useCallback, useEffect } from "react";

export default function SignatureDragger({
  sigId,
  signatureUrl,
  position,
  size,
  opacity,
  rotation,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  containerRef,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  const clampPosition = useCallback(
    (x, y, w, h) => {
      if (!containerRef?.current) return { x, y };
      const bounds = containerRef.current.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(x, bounds.width - w)),
        y: Math.max(0, Math.min(y, bounds.height - h)),
      };
    },
    [containerRef],
  );

  /* ── Drag handlers ──────────────────────────────────── */
  const handleDragStart = useCallback(
    (e) => {
      if (isResizing) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragOffset.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };

      // Adjust for container offset
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: clientX - rect.left - position.x,
          y: clientY - rect.top - position.y,
        };
      }

      setIsDragging(true);
    },
    [position, containerRef, isResizing],
  );

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      let newX, newY;
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        newX = clientX - rect.left - dragOffset.current.x;
        newY = clientY - rect.top - dragOffset.current.y;
      } else {
        newX = clientX - dragOffset.current.x;
        newY = clientY - dragOffset.current.y;
      }

      const clamped = clampPosition(newX, newY, size.width, size.height);
      onPositionChange(clamped);
    },
    [isDragging, containerRef, clampPosition, size, onPositionChange],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* ── Resize handlers ────────────────────────────────── */
  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      resizeStart.current = {
        mouseX: clientX,
        mouseY: clientY,
        width: size.width,
        height: size.height,
      };
      setIsResizing(true);
    },
    [size],
  );

  const handleResizeMove = useCallback(
    (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - resizeStart.current.mouseX;
      const dy = clientY - resizeStart.current.mouseY;
      // Keep aspect ratio by using the larger delta
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      const aspectRatio =
        resizeStart.current.width / resizeStart.current.height;

      let newWidth = Math.max(60, resizeStart.current.width + delta);
      let newHeight = newWidth / aspectRatio;

      if (newHeight < 30) {
        newHeight = 30;
        newWidth = newHeight * aspectRatio;
      }

      onSizeChange({ width: Math.round(newWidth), height: Math.round(newHeight) });
    },
    [isResizing, onSizeChange],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  /* ── Global event listeners ─────────────────────────── */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      window.addEventListener("touchmove", handleResizeMove, { passive: false });
      window.addEventListener("touchend", handleResizeEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
      window.removeEventListener("touchmove", handleResizeMove);
      window.removeEventListener("touchend", handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  if (!signatureUrl) return null;

  const showBorder = isSelected || isHovered || isDragging || isResizing;

  return (
    <div
      data-sig-id={sigId}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        opacity,
        transform: `rotate(${rotation}deg)`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 25 : 20,
        touchAction: "none",
        userSelect: "none",
      }}
      onMouseDown={(e) => {
        onSelect?.();
        handleDragStart(e);
      }}
      onTouchStart={(e) => {
        onSelect?.();
        handleDragStart(e);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dashed interactive border */}
      <div
        className="absolute inset-0 rounded transition-opacity duration-150"
        style={{
          border: "2px dashed",
          borderColor: showBorder
            ? "rgba(108, 99, 255, 0.7)"
            : "transparent",
          pointerEvents: "none",
        }}
      />

      {/* Signature image */}
      <img
        src={signatureUrl}
        alt="Signature"
        draggable={false}
        className="w-full h-full object-contain pointer-events-none select-none"
      />

      {/* Resize handle — bottom-right corner */}
      <div
        style={{
          position: "absolute",
          right: -5,
          bottom: -5,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: showBorder
            ? "rgba(108, 99, 255, 0.8)"
            : "transparent",
          border: showBorder ? "2px solid rgba(108, 99, 255, 1)" : "none",
          cursor: "nwse-resize",
          touchAction: "none",
        }}
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      />
    </div>
  );
}

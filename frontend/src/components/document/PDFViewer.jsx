import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PDFViewer({ pdfUrl, currentPage, onDocumentLoadSuccess }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);
    return () => observer.disconnect();
  }, []);

  const Spinner = () => (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden bg-surface/30 border border-white/[0.06]"
    >
      {pdfUrl ? (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Spinner />}
          error={
            <div className="flex items-center justify-center py-24 text-txt-muted text-sm">
              Failed to load PDF. Try a different file.
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth || undefined}
            renderAnnotationLayer
            renderTextLayer
            loading={<Spinner />}
          />
        </Document>
      ) : (
        <div className="flex items-center justify-center py-24 text-txt-muted/50 text-sm">
          No PDF loaded
        </div>
      )}
    </div>
  );
}

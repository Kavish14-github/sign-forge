import { useState, useCallback, useRef } from 'react';

/**
 * Custom React hook for managing PDF document state in SignForge.
 */
export default function usePDFDocument() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pdfBytesRef = useRef(null);

  const loadPDF = useCallback((file) => {
    // Revoke any existing object URL
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setCurrentPage(1);
    setNumPages(0);

    // Read the file as an ArrayBuffer and store raw bytes
    const reader = new FileReader();
    reader.onload = (e) => {
      pdfBytesRef.current = new Uint8Array(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const setPage = useCallback(
    (pageNum) => {
      if (pageNum >= 1 && pageNum <= numPages) {
        setCurrentPage(pageNum);
      }
    },
    [numPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < numPages ? prev + 1 : prev));
  }, [numPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const getPdfBytes = useCallback(() => {
    return pdfBytesRef.current;
  }, []);

  const reset = useCallback(() => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPdfFile(null);
    setNumPages(0);
    setCurrentPage(1);
    pdfBytesRef.current = null;
  }, []);

  return {
    pdfFile,
    pdfUrl,
    pdfBytes: pdfBytesRef.current,
    numPages,
    currentPage,
    setNumPages,
    loadPDF,
    setPage,
    nextPage,
    prevPage,
    getPdfBytes,
    reset,
  };
}

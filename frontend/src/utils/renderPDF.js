import { PDFDocument } from 'pdf-lib';

/**
 * Embeds a signature PNG image into a PDF document at the specified position.
 *
 * @param {Uint8Array} pdfBytes — the original PDF as raw bytes
 * @param {Uint8Array} signatureImageBytes — the signature PNG as raw bytes
 * @param {number} pageIndex — zero-based page index
 * @param {number} x — horizontal position from left edge
 * @param {number} y — vertical position from bottom edge
 * @param {number} width — drawn width of the signature
 * @param {number} height — drawn height of the signature
 * @param {number} [opacity=1] — opacity from 0 to 1
 * @param {number} [rotation=0] — rotation in degrees
 * @returns {Promise<Uint8Array>} — the modified PDF as Uint8Array
 */
export async function embedSignatureInPDF(
  pdfBytes,
  signatureImageBytes,
  pageIndex,
  x,
  y,
  width,
  height,
  opacity = 1,
  rotation = 0,
) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

  const pages = pdfDoc.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new RangeError(
      `pageIndex ${pageIndex} is out of range (0-${pages.length - 1})`,
    );
  }

  const page = pages[pageIndex];

  const rotationRadians = (rotation * Math.PI) / 180;

  page.drawImage(signatureImage, {
    x,
    y,
    width,
    height,
    opacity,
    rotate: { type: 'degrees', angle: rotation },
  });

  const modifiedPdfBytes = await pdfDoc.save();
  return new Uint8Array(modifiedPdfBytes);
}

/**
 * Triggers a browser download of PDF bytes as a file.
 *
 * @param {Uint8Array} pdfBytes
 * @param {string} [filename='signforge_signed.pdf']
 */
export function downloadPDF(pdfBytes, filename = 'signforge_signed.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

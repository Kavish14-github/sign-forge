/**
 * Embeds a signature PNG image into a PDF document at the specified position.
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
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

  const pages = pdfDoc.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new RangeError(
      `pageIndex ${pageIndex} is out of range (0-${pages.length - 1})`,
    );
  }

  const page = pages[pageIndex];

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
 */
export function downloadPDF(pdfBytes, filename = 'snapsign_signed.pdf') {
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

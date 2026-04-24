"use client";

// Extracts text from a PDF file entirely in the browser.
// pdfjs-dist works in the browser where DOMMatrix and Canvas APIs are available.
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = content.items.map((item: any) => item.str ?? "").join(" ");
    text += pageText + "\n";
  }

  await doc.destroy();
  return text;
}

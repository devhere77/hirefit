// // Client-only PDF text extraction using pdfjs-dist.
// import type { ParsedResume } from "./types";
// import { analyzeResume } from "./matcher";

// export async function parseResumePdf(file: File): Promise<ParsedResume> {
//   if (file.type !== "application/pdf") {
//     throw new Error("Only PDF files are allowed");
//   }
//   // Lazy import so SSR never touches pdfjs.
//   const pdfjs = await import("pdfjs-dist");
//   const version = (pdfjs as unknown as { version: string }).version;
//   pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

//   const buf = await file.arrayBuffer();
//   const doc = await pdfjs.getDocument({ data: buf }).promise;
//   let text = "";
//   for (let i = 1; i <= doc.numPages; i++) {
//     const page = await doc.getPage(i);
//     const content = await page.getTextContent();
//     text += content.items.map((it: unknown) => (it as { str?: string }).str ?? "").join(" ") + "\n";
//   }
//   return analyzeResume(text);
// }

// Client-only PDF text extraction using pdfjs-dist.
import type { ParsedResume } from "./types";
import { analyzeResume } from "./matcher";

export async function parseResumePdf(file: File): Promise<ParsedResume> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  // Lazy import so SSR never touches pdfjs.
  const pdfjs = await import("pdfjs-dist");
  const version = (pdfjs as unknown as { version: string }).version;

  // FIXED: Routing through jsDelivr's modular endpoint instead of cdnjs
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: unknown) => (it as { str?: string }).str ?? "").join(" ") + "\n";
  }
  return analyzeResume(text);
}

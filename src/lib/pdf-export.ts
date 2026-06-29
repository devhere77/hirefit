import { jsPDF } from "jspdf";

export function downloadResumePdf(text: string, fileName = "tailored-resume.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = text.split("\n");
  let y = margin;
  for (const raw of lines) {
    const isHeading = /^[A-Z][A-Z \/]{2,}$/.test(raw.trim());
    if (isHeading) {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    }
    const wrapped = doc.splitTextToSize(raw || " ", maxWidth);
    for (const w of wrapped) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(w, margin, y);
      y += 15;
    }
  }
  doc.save(fileName);
}
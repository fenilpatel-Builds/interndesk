import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadElementAsPdf(
  elementId: string,
  filename: string = "Internship_Offer_Letter.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found for PDF export.`);
  }

  // Ensure element is visible and styled properly
  const canvas = await html2canvas(element, {
    scale: 2.5, // High resolution for crystal clear print quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  // Standard A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  // Scale image to fit A4 exactly with proper margins
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    // If it exceeds one page, fit proportionally within the single A4 sheet
    const ratio = pdfHeight / imgHeight;
    const finalW = imgWidth * ratio;
    const offsetX = (pdfWidth - finalW) / 2;
    pdf.addImage(imgData, "PNG", offsetX, 0, finalW, pdfHeight);
  }

  // Directly trigger browser file download
  pdf.save(filename);
}

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  AKASH_HEADER_BASE64,
  AKASH_FOOTER_BASE64,
  AKASH_WATERMARK_BASE64,
  AKASH_STAMP_BASE64,
} from "./akash-letterhead-assets";

export interface OfferLetterData {
  salutation?: "Mr." | "Ms." | string;
  studentName: string;
  internshipPosition: string;
  technology?: string;
  commencementDate?: string;
  continueUntilDate?: string;
  letterDate?: string;
  title?: string;
  customDescription?: string;
  isCustomEdited?: boolean;
}

function base64ToUint8Array(base64Uri: string): Uint8Array {
  const base64 = base64Uri.replace(/^data:image\/\w+;base64,/, "");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64");
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateAkashOfferLetterPdf(data: OfferLetterData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  // Standard A4 dimensions: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const headerBytes = base64ToUint8Array(AKASH_HEADER_BASE64);
  const footerBytes = base64ToUint8Array(AKASH_FOOTER_BASE64);
  const watermarkBytes = base64ToUint8Array(AKASH_WATERMARK_BASE64);
  const stampBytes = base64ToUint8Array(AKASH_STAMP_BASE64);

  const [headerImg, footerImg, watermarkImg, stampImg] = await Promise.all([
    pdfDoc.embedPng(headerBytes),
    pdfDoc.embedPng(footerBytes),
    pdfDoc.embedPng(watermarkBytes),
    pdfDoc.embedPng(stampBytes),
  ]);

  // 1. Watermark centered matching authentic PDF
  page.drawImage(watermarkImg, {
    x: 167.57,
    y: 264.588,
    width: 260.14,
    height: 260.14,
    opacity: 0.15,
  });

  // 2. Header banner edge to edge (595pt full width) matching authentic PDF
  page.drawImage(headerImg, {
    x: 0.265,
    y: 773.552,
    width: 594.75,
    height: 53.338,
  });

  // 3. Footer banner matching authentic PDF
  page.drawImage(footerImg, {
    x: 35.14,
    y: 12.148,
    width: 525.0,
    height: 35.102,
  });

  // 4. Date right aligned matching authentic PDF
  const letterDate = data.letterDate || "01-07-2026";
  page.drawText(`Date :${letterDate}`, {
    x: 430.223,
    y: 738.703,
    font: fontRegular,
    size: 13.5,
    color: rgb(0, 0, 0),
  });

  // 5. Title centered & underlined matching authentic PDF
  const titleText = (data.title || "INTERNSHIP OFFER LETTER").toUpperCase();
  page.drawText(titleText, {
    x: 172.63,
    y: 695.324,
    font: fontBold,
    size: 18.0,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 172.63, y: 691.409 },
    end: { x: 422.65, y: 691.409 },
    thickness: 0.9,
    color: rgb(0, 0, 0),
  });

  // Layout parameters matching authentic PDF
  const maxWidth = 475.28;
  const leftX = 60.0;
  let currentY = 642.753;
  const lineHeight = 17.094;
  const fontSize = 12.0;

  function renderTokensAsLines(tokens: { text: string; bold: boolean }[]) {
    const lines: { text: string; bold: boolean; font: any; width: number }[][] = [];
    let curLine: { text: string; bold: boolean; font: any; width: number }[] = [];
    let curWidth = 0;

    for (const tok of tokens) {
      const font = tok.bold ? fontBold : fontRegular;
      const parts = tok.text.split(" ");
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const isLastInToken = i === parts.length - 1;
        const textWithSpace = isLastInToken ? p : p + " ";
        const w = font.widthOfTextAtSize(textWithSpace, fontSize);

        if (curWidth + w > maxWidth && curLine.length > 0) {
          lines.push(curLine);
          curLine = [];
          curWidth = 0;
        }

        if (curLine.length > 0 && curLine[curLine.length - 1].bold === tok.bold) {
          curLine[curLine.length - 1].text += textWithSpace;
          curLine[curLine.length - 1].width += w;
        } else {
          curLine.push({ text: textWithSpace, bold: tok.bold, font, width: w });
        }
        curWidth += w;
      }
    }
    if (curLine.length > 0) lines.push(curLine);

    for (const l of lines) {
      let x = leftX;
      for (const chk of l) {
        page.drawText(chk.text, { x, y: currentY, font: chk.font, size: fontSize, color: rgb(0, 0, 0) });
        x += chk.width;
      }
      currentY -= lineHeight;
    }
    currentY -= 12.0; // Paragraph gap
  }

  const rawName = data.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
  const sal = data.salutation || (data.studentName.startsWith("Ms.") ? "Ms." : "Mr.");
  const isGirl = sal === "Ms.";
  const pronounHeShe = isGirl ? "she" : "he";
  const pronounHisHer = isGirl ? "her" : "his";
  const pronounCapitalHisHer = isGirl ? "Her" : "His";
  const pronounCapitalHeShe = isGirl ? "She" : "He";
  const pronounHimHer = isGirl ? "her" : "him";

  const position = data.internshipPosition || "AI/ML Intern";
  const rawTech = data.technology || (position.includes("Intern") ? position.replace(/\s*Intern/i, "") : position);
  const tech = rawTech.replace(/\s*technology/i, "").trim() || "AI/ML";
  const startDate = data.commencementDate || "3rd July 2026";
  const endDate = data.continueUntilDate || "30th April 2027";

  if (data.isCustomEdited && data.customDescription) {
    const paras = data.customDescription.split("\n\n");
    for (const para of paras) {
      if (!para.trim()) continue;
      if (para.includes(tech)) {
        const parts = para.split(tech);
        const tokens: { text: string; bold: boolean }[] = [];
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) tokens.push({ text: parts[i], bold: false });
          if (i < parts.length - 1) tokens.push({ text: tech, bold: true });
        }
        renderTokensAsLines(tokens);
      } else {
        renderTokensAsLines([{ text: para.trim(), bold: false }]);
      }
    }
  } else {
    // Paragraph 1 with authentic bold highlights
    renderTokensAsLines([
      { text: "     This is to inform that ", bold: false },
      { text: `${sal} ${rawName}`, bold: true },
      { text: " has been selected for an internship at ", bold: false },
      { text: "Akash Technolabs", bold: true },
      { text: " as a ", bold: false },
      { text: position, bold: true },
      { text: `. ${pronounCapitalHisHer} internship will commence on `, bold: false },
      { text: startDate, bold: true },
      { text: " and continue until ", bold: false },
      { text: endDate, bold: true },
      { text: ".", bold: false },
    ]);

    // Paragraph 2 with technology highlighted in bold
    renderTokensAsLines([
      { text: `During the internship period, ${pronounHeShe} will work on `, bold: false },
      { text: tech, bold: true },
      {
        text: ` technology and will be involved in projects and assignments designed to enhance ${pronounHisHer} technical knowledge and practical skills. ${pronounCapitalHeShe} is expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${pronounHisHer} assigned responsibilities with sincerity and dedication throughout the internship.`,
        bold: false,
      },
    ]);

    // Paragraph 3 with authentic bold highlights
    renderTokensAsLines([
      { text: `Upon successful completion of the internship, ${pronounHeShe} will be awarded an `, bold: false },
      { text: "Internship Completion Certificate", bold: true },
      { text: ` based on ${pronounHisHer} performance and adherence to the company's rules and regulations.`, bold: false },
    ]);

    // Paragraph 4
    renderTokensAsLines([
      {
        text: `We are pleased to welcome ${pronounHimHer} to Akash Technolabs and wish ${pronounHimHer} a successful and enriching internship experience.`,
        bold: false,
      },
    ]);
  }

  // Signatory matching authentic PDF
  currentY = 345.078;
  page.drawText("Sincerely", {
    x: leftX,
    y: currentY,
    font: fontRegular,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  page.drawImage(stampImg, {
    x: leftX,
    y: 277.004,
    width: 75.0,
    height: 64.167,
  });

  page.drawText("Akash Padhiyar", {
    x: leftX,
    y: 261.375,
    font: fontRegular,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  page.drawText("CEO", {
    x: leftX,
    y: 241.839,
    font: fontRegular,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  return await pdfDoc.save();
}

/**
 * Direct client-side PDF download triggering browser download manager (zero print dialog).
 */
export async function downloadAkashOfferLetterPdf(
  data: OfferLetterData,
  filename?: string
): Promise<void> {
  const pdfBytes = await generateAkashOfferLetterPdf(data);
  const rawName = data.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
  const safeFilename =
    filename || `${rawName.replace(/\s+/g, "_")}_Internship_Offer_Letter.pdf`;

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


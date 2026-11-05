import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  AKASH_HEADER_BASE64,
  AKASH_FOOTER_BASE64,
  AKASH_WATERMARK_BASE64,
  AKASH_STAMP_BASE64,
} from "./akash-letterhead-assets";
import {
  generateLetterContent,
  tokenizeMarkdown,
  LetterTemplateKey,
} from "./letter-templates";

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
  templateType?: LetterTemplateKey | string;
  universityId?: string;
  customUniversity?: string;
  purpose?: string;
  signatoryName?: string;
  signatoryRole?: string;
  attachedFile?: { name: string; size?: number; type?: string };
}

export function isFemaleCandidate(name?: string, salutation?: string): boolean {
  if (salutation === "Ms." || salutation === "Mrs." || salutation === "Miss") return true;
  if (!name) return false;
  const lower = name.toLowerCase().trim();
  if (
    lower.startsWith("ms.") ||
    lower.startsWith("ms ") ||
    lower.startsWith("miss") ||
    lower.startsWith("mrs.")
  ) {
    return true;
  }
  const femalePatterns = [
    "priya", "neha", "pooja", "ananya", "riddhi", "isha", "shreya",
    "aditi", "kavita", "sneha", "sakshi", "tanvi", "divya", "khushi",
    "aayushi", "ayushi", "drasti", "drashti", "diya", "prachi", "simran", "kiran"
  ];
  return femalePatterns.some((fn) => lower.includes(fn));
}

export function deriveTrackTechnology(position?: string, customTech?: string): string {
  if (customTech && !customTech.toLowerCase().includes("practicum") && customTech.trim().length > 0) {
    return customTech.replace(/\s*technology/i, "").trim();
  }
  if (!position) return "AI/ML";
  const pos = position.toLowerCase().trim();

  if (pos.includes("php") || pos.includes("laravel")) return "PHP / Laravel";
  if (pos.includes("ai/ml") || pos.includes("machine learning") || (pos.includes("ai") && !pos.includes("email") && !pos.includes("detail"))) return "AI/ML";
  if (pos.includes("cyber") || pos.includes("security")) return "Cybersecurity";
  if (pos.includes("python")) return "Python";
  if (pos.includes("full stack") || pos.includes("mern") || pos.includes("web dev")) return "Full Stack Web Development";
  if (pos.includes("data science") || pos.includes("analytics")) return "Data Science & Analytics";
  if (pos.includes("cloud") || pos.includes("devops") || pos.includes("aws")) return "Cloud & DevOps";
  if (pos.includes("flutter") || pos.includes("mobile") || pos.includes("android") || pos.includes("ios")) return "Flutter & Mobile App Development";
  if (pos.includes("ui") || pos.includes("ux") || pos.includes("design")) return "UI/UX Design";
  if (pos.includes("java") && !pos.includes("javascript")) return "Java";
  if (pos.includes("qa") || pos.includes("testing") || pos.includes("quality assurance")) return "Software Testing & QA";
  if (pos.includes("iot") || pos.includes("embedded")) return "Embedded Systems & IoT";

  const cleaned = position
    .replace(/\s*Developer\s*Intern/i, "")
    .replace(/\s*Intern/i, "")
    .replace(/\s*technology/i, "")
    .trim();

  return cleaned || "Information Technology";
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

  // 5. Title centered & underlined with dynamic width matching text
  const titleText = (data.title || "INTERNSHIP OFFER LETTER").toUpperCase();
  const titleFontSize = 17.0;
  const titleWidth = fontBold.widthOfTextAtSize(titleText, titleFontSize);
  const titleX = Math.max(45, (595.28 - titleWidth) / 2);

  page.drawText(titleText, {
    x: titleX,
    y: 695.324,
    font: fontBold,
    size: titleFontSize,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: titleX, y: 691.409 },
    end: { x: titleX + titleWidth, y: 691.409 },
    thickness: 0.9,
    color: rgb(0, 0, 0),
  });

  // Candidate and role information
  const rawName = data.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
  const isGirl = isFemaleCandidate(data.studentName, data.salutation);
  const sal = (data.salutation as "Mr." | "Ms.") || (isGirl ? "Ms." : "Mr.");
  const position = data.internshipPosition || "AI/ML Intern";
  const tech = deriveTrackTechnology(position, data.technology);
  const startDate = data.commencementDate || "3rd July 2026";
  const endDate = data.continueUntilDate || "30th April 2027";

  // Layout parameters
  const leftX = 60.0;
  let currentY = 650.0;

  // Determine text content to render
  let fullBodyText = "";
  if (data.isCustomEdited && data.customDescription?.trim()) {
    fullBodyText = data.customDescription.trim();
  } else {
    // Generate text from template catalog
    const generated = generateLetterContent({
      templateKey: data.templateType || (isGirl ? "AKASH_STANDARD_GIRL" : "AKASH_STANDARD_BOY"),
      salutation: sal,
      studentName: rawName,
      internshipPosition: position,
      technology: tech,
      commencementDate: startDate,
      continueUntilDate: endDate,
      letterDate,
      universityId: data.universityId,
      customUniversity: data.customUniversity,
      purpose: data.purpose,
      signatoryName: data.signatoryName,
      signatoryRole: data.signatoryRole,
    });
    fullBodyText = generated.fullText;
  }

  // Keywords that should be bolded automatically in paragraphs
  const boldKeywords = [
    `${sal} ${rawName}`,
    rawName,
    "Akash Technolabs",
    position,
    startDate,
    endDate,
    tech,
    "Internship Completion Certificate",
    "TO WHOMSOEVER IT MAY CONCERN",
  ].filter(Boolean);

  // Split text into paragraphs
  const paragraphs = fullBodyText.split(/\n\s*\n/);
  const totalParas = paragraphs.length;

  // Dynamic typography to fit any document density cleanly on 1 page
  let fontSize = 11.5;
  let lineHeight = 16.5;
  let paraGap = 10.0;

  if (totalParas > 6 || fullBodyText.length > 1200) {
    fontSize = 10.2;
    lineHeight = 14.5;
    paraGap = 7.5;
  } else if (totalParas > 4 || fullBodyText.length > 850) {
    fontSize = 11.0;
    lineHeight = 15.5;
    paraGap = 9.0;
  }

  function renderTokens(
    tokens: { text: string; bold: boolean }[],
    indentX: number = leftX
  ) {
    const lines: { text: string; bold: boolean; font: any; width: number }[][] = [];
    let curLine: { text: string; bold: boolean; font: any; width: number }[] = [];
    let curWidth = 0;
    const availWidth = 595.28 - indentX - 60.0;

    for (const tok of tokens) {
      const font = tok.bold ? fontBold : fontRegular;
      const parts = tok.text.split(" ");
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p && i > 0 && i < parts.length - 1) continue;
        const isLastInToken = i === parts.length - 1;
        const textWithSpace = isLastInToken ? p : p + " ";
        const w = font.widthOfTextAtSize(textWithSpace, fontSize);

        if (curWidth + w > availWidth && curLine.length > 0) {
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
      let x = indentX;
      for (const chk of l) {
        page.drawText(chk.text, {
          x,
          y: currentY,
          font: chk.font,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        x += chk.width;
      }
      currentY -= lineHeight;
    }
  }

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Filter out redundant elements that are already part of official letterhead
    const cleanLine = trimmed.replace(/^\*\*|\*\*$/g, "").replace(/^<b>|<\/b>$/gi, "").trim();
    if (/^akash\s*technolabs$/i.test(cleanLine)) continue;
    if (cleanLine.toUpperCase() === titleText) continue;
    if (/^date\s*:/i.test(cleanLine)) continue;
    if (/^for\s*akash\s*technolabs$/i.test(cleanLine)) continue;
    if (/^authorized\s*signatory$/i.test(cleanLine)) continue;

    // Check if paragraph is a single line header (like "TO WHOMSOEVER IT MAY CONCERN")
    if (/^(\*\*)?TO WHOMSOEVER IT MAY CONCERN(\*\*)?$/i.test(trimmed)) {
      page.drawText("TO WHOMSOEVER IT MAY CONCERN", {
        x: leftX,
        y: currentY,
        font: fontBold,
        size: fontSize + 0.5,
        color: rgb(0, 0, 0),
      });
      currentY -= lineHeight + paraGap;
      continue;
    }

    if (
      /^(\*\*)?To,/i.test(trimmed) ||
      /^(\*\*)?Subject:/i.test(trimmed) ||
      /^(\*\*)?Dear\s/i.test(trimmed)
    ) {
      const lines = trimmed.split("\n");
      for (const line of lines) {
        const isSubj = line.toLowerCase().includes("subject:");
        const isTo = line.toLowerCase().includes("to,");
        const lineTokens = tokenizeMarkdown(line, boldKeywords);
        if (isSubj || isTo) {
          lineTokens.forEach((t) => (t.bold = true));
        }
        renderTokens(lineTokens, leftX);
      }
      currentY -= paraGap;
      continue;
    }

    // Check if paragraph contains bullet items (e.g. Experience Letter)
    if (trimmed.includes("• ") || trimmed.includes("- ")) {
      const lines = trimmed.split("\n");
      for (const line of lines) {
        const lTrim = line.trim();
        if (lTrim.startsWith("• ") || lTrim.startsWith("- ")) {
          const bulletText = lTrim.replace(/^[•\-]\s*/, "");
          // Draw bullet
          page.drawText("•", {
            x: leftX + 12,
            y: currentY,
            font: fontBold,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          const bTokens = tokenizeMarkdown(bulletText, boldKeywords);
          renderTokens(bTokens, leftX + 24);
        } else {
          const lTokens = tokenizeMarkdown(lTrim, boldKeywords);
          renderTokens(lTokens, leftX);
        }
      }
      currentY -= paraGap;
      continue;
    }

    // Standard paragraph with markdown parsing & bold keyword matching
    const isIntroIndent = trimmed.startsWith("This is to inform");
    const prefix = isIntroIndent ? "     " : "";
    const textToParse = prefix + trimmed;
    const tokens = tokenizeMarkdown(textToParse, boldKeywords);

    renderTokens(tokens, leftX);
    currentY -= paraGap;
  }

  // Draw Official Attachment note if file attached
  if (data.attachedFile?.name) {
    page.drawText(`[Official Attachment / Reference: ${data.attachedFile.name}]`, {
      x: leftX,
      y: currentY - 4,
      font: fontBold,
      size: fontSize - 1.5,
      color: rgb(0.06, 0.3, 0.51),
    });
    currentY -= 16;
  }

  // Calculate clean, collision-free position for Signatory Block
  // Ensure it never overlaps body text AND never overlaps footer (footer top is at y: 47)
  const signOffY = Math.max(Math.min(currentY - 10, 345), 160);

  page.drawText("Sincerely", {
    x: leftX,
    y: signOffY,
    font: fontRegular,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  page.drawImage(stampImg, {
    x: leftX,
    y: signOffY - 68,
    width: 75.0,
    height: 64.167,
  });

  page.drawText(data.signatoryName || "Akash Padhiyar", {
    x: leftX,
    y: signOffY - 84,
    font: fontBold,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.signatoryRole || "CEO", {
    x: leftX,
    y: signOffY - 100,
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
  const cleanTitle = (data.title || "Internship_Document").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeFilename =
    filename || `${rawName.replace(/\s+/g, "_")}_${cleanTitle}.pdf`;

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

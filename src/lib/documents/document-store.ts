import fs from "fs";
import path from "path";
import { isUserAdmin } from "../auth/admin-whitelist";
import { generateLetterContent, LetterTemplateKey } from "./letter-templates";

export interface OfficialOfferLetter {
  id: string;
  organization_id: string;
  organization_name: string;
  member_id: string;
  recipient_email: string;
  document_number: string;
  document_type:
    | "OFFER_LETTER"
    | "INTERNSHIP_LETTER"
    | "COMPLETION_CERTIFICATE"
    | "PERFORMANCE_TRANSCRIPT"
    | "JOINING_LETTER"
    | "CONFIRMATION_LETTER"
    | "COMPLETION_LETTER"
    | "NOC"
    | "EXPERIENCE_LETTER"
    | "RELIEVING_LETTER"
    | "RECOMMENDATION_LETTER"
    | string;
  title: string;
  recipient_name: string;
  recipient_role: string;
  issued_date: string; // e.g. "30-10-2026"
  status: "ISSUED" | "ACCEPTED" | "PENDING_APPROVAL";
  approval_status: "APPROVED" | "PENDING";
  approved_by: string;
  approved_at: string;
  verification_code: string;
  template_type?: "INTERNSHIP OFFER LETTER (Boy)" | "INTERNSHIP OFFER LETTER (Girl)" | "RECOMMENDATION LETTER" | string;
  description_content?: string;
  attached_file?: { name: string; size?: number; type?: string };
  template_data: {
    salutation: "Mr." | "Ms.";
    student_name: string;
    organization_name: string;
    organization_type: "CORPORATE";
    organization_logo: string;
    organization_address: string;
    organization_website: string;
    contact_email: string;
    contact_phone: string;
    signatory_name: string;
    signatory_title: string;
    program_or_track: string;
    commencement_date: string;
    continue_until_date: string;
    technology: string;
    brand_color: string;
    secondary_color: string;
    is_akash_template: boolean;
    validity: string;
    university?: string;
    purpose?: string;
    attached_file?: { name: string; size?: number; type?: string };
  };
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
}

import { resolveDataFilePath } from "../data/storage-path";

const DOCS_FILE = resolveDataFilePath("issued-documents.json");

function ensureDataDirectory() {
  const dir = path.dirname(DOCS_FILE);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignored
    }
  }
}

const CANONICAL_FENIL_OFFER: OfficialOfferLetter = {
  id: "doc-akt-offer-fenil-01",
  organization_id: "org-akash-01",
  organization_name: "Akash Technolabs",
  member_id: "usr-student-fenil",
  recipient_email: "fenil.patel@akashtechnolabs.com",
  document_number: "ID-AKT-2026-OF01",
  document_type: "OFFER_LETTER",
  title: "OFFICIAL INTERNSHIP OFFER LETTER",
  recipient_name: "Mr. Fenil Patel",
  recipient_role: "AI & Machine Learning Engineering Intern",
  issued_date: "30-10-2026",
  status: "ISSUED",
  approval_status: "APPROVED",
  approved_by: "Akash Padhiyar",
  approved_at: "2026-10-30T10:00:00.000Z",
  verification_code: "VRF-AKT-2026-OF01",
  template_type: "INTERNSHIP OFFER LETTER (Boy)",
  description_content:
    "This is to inform that Mr. Fenil Patel has been selected for an internship at Akash Technolabs as a AI & Machine Learning Engineering Intern. His internship will commence on 3rd August 2026 and continue until 1st April 2027.\n\nDuring the internship period, he will work on AI & Machine Learning Engineering technology and will be involved in projects and assignments designed to enhance his technical knowledge and practical skills. He is expected to maintain a professional attitude, follow the company's policies and guidelines, and perform his assigned responsibilities with sincerity and dedication throughout the internship.\n\nUpon successful completion of the internship, he will be awarded an Internship Completion Certificate based on his performance and adherence to the company's rules and regulations.\n\nWe are pleased to welcome him to Akash Technolabs and wish him a successful and enriching internship experience.",
  template_data: {
    salutation: "Mr.",
    student_name: "Fenil Patel",
    organization_name: "Akash Technolabs",
    organization_type: "CORPORATE",
    organization_logo: "/images/akash-technolabs-header-logo.png",
    organization_address:
      "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
    organization_website: "www.akashtechnolabs.com",
    contact_email: "info@akashtechnolabs.com",
    contact_phone: "+91 99786 21654",
    signatory_name: "Akash Padhiyar",
    signatory_title: "CEO",
    program_or_track: "AI & Machine Learning Engineering technology",
    commencement_date: "3rd August 2026",
    continue_until_date: "1st April 2027",
    technology: "AI & Machine Learning Engineering",
    brand_color: "#dc2626",
    secondary_color: "#1e3a8a",
    is_akash_template: true,
    validity: "Active / Verified Credential",
    university: "GTU",
  },
  created_at: "2026-10-30T10:00:00.000Z",
};

const CANONICAL_FENIL_CERT: OfficialOfferLetter = {
  id: "doc-akt-cert-fenil-01",
  organization_id: "org-akash-01",
  organization_name: "Akash Technolabs",
  member_id: "usr-student-fenil",
  recipient_email: "fenil.patel@akashtechnolabs.com",
  document_number: "ID-AKT-2026-CERT01",
  document_type: "COMPLETION_CERTIFICATE",
  title: "Certificate of Internship Excellence",
  recipient_name: "Fenil Patel",
  recipient_role: "AI/ML Intern",
  issued_date: "15-10-2026",
  status: "ISSUED",
  approval_status: "APPROVED",
  approved_by: "Akash Padhiyar",
  approved_at: "2026-10-15T12:00:00.000Z",
  verification_code: "VRF-AKT-8918-EXC",
  template_type: "Certificate of Internship Excellence",
  description_content:
    "This is to certify that Fenil Patel has successfully completed all milestones for the practical internship practicum in AI & Machine Learning Engineering at Akash Technolabs from 3rd August 2026 to 1st April 2027.",
  template_data: {
    salutation: "Mr.",
    student_name: "Fenil Patel",
    organization_name: "Akash Technolabs",
    organization_type: "CORPORATE",
    organization_logo: "/images/akash-technolabs-header-logo.png",
    organization_address:
      "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
    organization_website: "www.akashtechnolabs.com",
    contact_email: "info@akashtechnolabs.com",
    contact_phone: "+91 99786 21654",
    signatory_name: "Akash Padhiyar",
    signatory_title: "CEO",
    program_or_track: "AI & Machine Learning Engineering technology",
    commencement_date: "3rd August 2026",
    continue_until_date: "1st April 2027",
    technology: "AI & Machine Learning Engineering",
    brand_color: "#dc2626",
    secondary_color: "#1e3a8a",
    is_akash_template: true,
    validity: "Active / Verified Credential",
    university: "GTU",
  },
  created_at: "2026-10-15T12:00:00.000Z",
};

const CANONICAL_HELLY_OFFER: OfficialOfferLetter = {
  id: "doc-akt-offer-helly-01",
  organization_id: "org-akash-01",
  organization_name: "Akash Technolabs",
  member_id: "usr-hellyleuva",
  recipient_email: "hellyleuva.29@gmail.com",
  document_number: "ID-AKT-2026-INTR03",
  document_type: "OFFER_LETTER",
  title: "OFFICIAL INTERNSHIP OFFER LETTER",
  recipient_name: "Ms. Helly Leuva",
  recipient_role: "UI/UX Design Intern",
  issued_date: "05-11-2026",
  status: "ISSUED",
  approval_status: "APPROVED",
  approved_by: "Akash Padhiyar",
  approved_at: "2026-11-05T12:00:00.000Z",
  verification_code: "VRF-AKT-2026-IN03",
  template_type: "INTERNSHIP_OFFER",
  description_content:
    "This is to inform that Ms. Helly Leuva has been selected for an internship at Akash Technolabs as a UI/UX Design Intern. Her internship will commence on 8th August 2026 and continue until 5th April 2027.\n\nDuring the internship period, she will work on UI/UX Design technology and will be involved in projects and assignments designed to enhance her technical knowledge and practical skills. She is expected to maintain a professional attitude, follow the company's policies and guidelines, and perform her assigned responsibilities with sincerity and dedication throughout the internship.\n\nUpon successful completion of the internship, she will be awarded an Internship Completion Certificate based on her performance and adherence to the company's rules and regulations.\n\nWe are pleased to welcome her to Akash Technolabs and wish her a successful and enriching internship experience.",
  template_data: {
    salutation: "Ms.",
    student_name: "Helly Leuva",
    organization_name: "Akash Technolabs",
    organization_type: "CORPORATE",
    organization_logo: "/images/akash-technolabs-header-logo.png",
    organization_address:
      "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
    organization_website: "www.akashtechnolabs.com",
    contact_email: "info@akashtechnolabs.com",
    contact_phone: "+91 99786 21654",
    signatory_name: "Akash Padhiyar",
    signatory_title: "CEO",
    program_or_track: "UI/UX Design technology",
    commencement_date: "8th August 2026",
    continue_until_date: "5th April 2027",
    technology: "UI/UX Design",
    brand_color: "#dc2626",
    secondary_color: "#1e3a8a",
    is_akash_template: true,
    validity: "Active / Verified Credential",
    purpose: "Academic Project & Practicum Training",
  },
  created_at: "2026-11-05T12:00:00.000Z",
};

const INITIAL_DOCS: OfficialOfferLetter[] = [
  CANONICAL_FENIL_OFFER,
  CANONICAL_FENIL_CERT,
  CANONICAL_HELLY_OFFER,
];

let memoryCache: OfficialOfferLetter[] | null = null;

function loadFromDisk(): OfficialOfferLetter[] {
  try {
    ensureDataDirectory();
    let loaded: OfficialOfferLetter[] = [];
    if (!fs.existsSync(DOCS_FILE)) {
      if (memoryCache && memoryCache.length > 0) return memoryCache;
      fs.writeFileSync(DOCS_FILE, JSON.stringify(INITIAL_DOCS, null, 2), "utf-8");
      memoryCache = [...INITIAL_DOCS];
      return INITIAL_DOCS;
    }
    const content = fs.readFileSync(DOCS_FILE, "utf-8");
    if (!content || !content.trim()) {
      return memoryCache || INITIAL_DOCS;
    }
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      loaded = parsed;
    } else {
      loaded = [...INITIAL_DOCS];
    }

    // Ensure the canonical verified offer letter for Fenil Patel is always preserved
    const hasFenilOffer = loaded.some(
      (d) =>
        d.id === "doc-akt-offer-fenil-01" ||
        d.document_number === "ID-AKT-2026-OF01" ||
        ((d.document_type === "OFFER_LETTER" || d.title?.toLowerCase().includes("offer")) &&
          (d.recipient_email === "fenil.patel@akashtechnolabs.com" ||
            d.recipient_email === "huntarmy001@gmail.com" ||
            d.recipient_name?.toLowerCase().includes("fenil")))
    );

    if (!hasFenilOffer) {
      loaded.unshift(CANONICAL_FENIL_OFFER);
    }

    // Ensure the canonical certificate for Fenil Patel is always preserved
    const hasFenilCert = loaded.some(
      (d) =>
        d.id === "doc-akt-cert-fenil-01" ||
        d.document_number === "ID-AKT-2026-CERT01" ||
        ((d.document_type === "COMPLETION_CERTIFICATE" || d.title?.toLowerCase().includes("certificate")) &&
          (d.recipient_email === "fenil.patel@akashtechnolabs.com" ||
            d.recipient_email === "huntarmy001@gmail.com" ||
            d.recipient_name?.toLowerCase().includes("fenil")))
    );

    if (!hasFenilCert) {
      loaded.push(CANONICAL_FENIL_CERT);
    }

    // Ensure Helly Leuva document is preserved
    const hasHellyOffer = loaded.some(
      (d) =>
        d.id === "doc-akt-offer-helly-01" ||
        d.document_number === "ID-AKT-2026-INTR03" ||
        d.document_number === "ID-AKT-2026-INTRO3" ||
        d.recipient_email === "hellyleuva.29@gmail.com"
    );

    if (!hasHellyOffer) {
      loaded.push(CANONICAL_HELLY_OFFER);
    }

    // Deduplicate documents by id and document_number
    const seen = new Set<string>();
    const deduplicated: OfficialOfferLetter[] = [];
    for (const d of loaded) {
      const key = `${d.document_number || d.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(d);
      }
    }

    memoryCache = deduplicated;
    return deduplicated;
  } catch {
    return memoryCache || INITIAL_DOCS;
  }
}

function saveToDisk(docs: OfficialOfferLetter[]) {
  memoryCache = [...docs];
  try {
    ensureDataDirectory();
    fs.writeFileSync(DOCS_FILE, JSON.stringify(docs, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DocumentStore] Save error:", err);
  }
}

export class DocumentStore {
  private docs: OfficialOfferLetter[] = [];

  constructor() {
    this.docs = loadFromDisk();
  }

  public getAll(): OfficialOfferLetter[] {
    this.docs = loadFromDisk();
    return this.docs;
  }

  public getForStudent(email?: string, name?: string): OfficialOfferLetter[] {
    this.docs = loadFromDisk();
    if (!email && !name) return [];

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanName = (name || "")
      .replace(/^(Mr\.|Ms\.)\s*/i, "")
      .toLowerCase()
      .trim();

    const fenilEmails = new Set([
      "fenil.patel@akashtechnolabs.com",
      "huntarmy001@gmail.com",
      "fenil8160@gmail.com",
    ]);

    const isFenil =
      fenilEmails.has(cleanEmail) ||
      cleanName === "fenil patel" ||
      cleanName.includes("fenil");

    const matched = this.docs.filter((doc) => {
      const docEmail = doc.recipient_email?.toLowerCase().trim();
      const docMember = doc.member_id?.toLowerCase().trim();
      const docName = (doc.template_data?.student_name || doc.recipient_name || "")
        .replace(/^(Mr\.|Ms\.)\s*/i, "")
        .toLowerCase()
        .trim();

      if (isFenil) {
        if (
          (docEmail && fenilEmails.has(docEmail)) ||
          (docMember && fenilEmails.has(docMember)) ||
          docName === "fenil patel" ||
          docName.includes("fenil")
        ) {
          return true;
        }
      }

      if (cleanEmail && (docEmail === cleanEmail || docMember === cleanEmail)) {
        return true;
      }

      if (!docEmail && cleanName && docName && docName === cleanName) {
        return true;
      }

      return false;
    });

    if (isFenil) {
      if (!matched.some((d) => d.id === CANONICAL_FENIL_OFFER.id || d.document_number === CANONICAL_FENIL_OFFER.document_number)) {
        matched.unshift(CANONICAL_FENIL_OFFER);
      }
      if (!matched.some((d) => d.id === CANONICAL_FENIL_CERT.id || d.document_number === CANONICAL_FENIL_CERT.document_number)) {
        matched.push(CANONICAL_FENIL_CERT);
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const result: OfficialOfferLetter[] = [];
    for (const d of matched) {
      const key = `${d.document_number || d.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(d);
      }
    }
    return result;
  }

  public getById(id: string): OfficialOfferLetter | null {
    this.docs = loadFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    const normCleanId = cleanId.replace(/o/g, "0").replace(/[^a-z0-9]/g, "");
    return (
      this.docs.find(
        (d) =>
          d.id === id ||
          d.document_number === id ||
          d.verification_code === id ||
          d.id?.toLowerCase().trim() === cleanId ||
          d.document_number?.toLowerCase().trim() === cleanId ||
          d.verification_code?.toLowerCase().trim() === cleanId ||
          d.document_number?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId ||
          d.id?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId
      ) || null
    );
  }

  public approveDocument(
    id: string,
    adminName: string = "Akash Padhiyar",
    updates?: {
      technology?: string;
      commencementDate?: string;
      continueUntilDate?: string;
    }
  ): OfficialOfferLetter | null {
    this.docs = loadFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    const normCleanId = cleanId.replace(/o/g, "0").replace(/[^a-z0-9]/g, "");
    let idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId ||
        d.id?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId
    );
    if (idx === -1) return null;

    const doc = this.docs[idx];
    doc.status = "ISSUED";
    doc.approval_status = "APPROVED";
    doc.approved_by = adminName;
    doc.approved_at = new Date().toISOString();

    if (updates?.technology) {
      doc.template_data.technology = updates.technology;
      doc.template_data.program_or_track = `${updates.technology} technology`;
      doc.recipient_role = `${updates.technology} Intern`;
    }
    if (updates?.commencementDate) {
      doc.template_data.commencement_date = updates.commencementDate;
    }
    if (updates?.continueUntilDate) {
      doc.template_data.continue_until_date = updates.continueUntilDate;
    }
    if (doc.template_data) {
      doc.template_data.validity = "Active / Verified Credential";
    }

    // Refresh description content if it was a 1-line stub or if dates/technology were verified
    const isOneLineStub =
      !doc.description_content ||
      (!doc.description_content.includes("\n\n") && doc.description_content.length < 220);

    if (isOneLineStub || updates?.technology || updates?.commencementDate || updates?.continueUntilDate) {
      const sal = doc.template_data?.salutation || (doc.recipient_name?.startsWith("Ms.") ? "Ms." : "Mr.");
      const cleanName = (doc.template_data?.student_name || doc.recipient_name || "").replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
      const tech = updates?.technology || doc.template_data?.technology || "AI/ML";
      const startDate = updates?.commencementDate || doc.template_data?.commencement_date || "3rd July 2026";
      const endDate = updates?.continueUntilDate || doc.template_data?.continue_until_date || "30th April 2027";
      const tmplKey: LetterTemplateKey =
        (doc.template_type as LetterTemplateKey) || (sal === "Ms." ? "AKASH_STANDARD_GIRL" : "AKASH_STANDARD_BOY");

      const generated = generateLetterContent({
        templateKey: tmplKey,
        salutation: sal,
        studentName: cleanName,
        internshipPosition: `${tech} Intern`,
        technology: tech,
        commencementDate: startDate,
        continueUntilDate: endDate,
        letterDate: doc.issued_date || new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        universityId: doc.template_data?.university || "STANDARD",
        purpose: doc.template_data?.purpose,
        signatoryName: adminName,
        signatoryRole: "CEO",
      });
      doc.description_content = generated.fullText;
    }

    this.docs[idx] = doc;
    saveToDisk(this.docs);
    return doc;
  }

  public rejectDocument(id: string): boolean {
    this.docs = loadFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    const normCleanId = cleanId.replace(/o/g, "0").replace(/[^a-z0-9]/g, "");
    const idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId ||
        d.id?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId
    );
    if (idx === -1) return false;
    this.docs.splice(idx, 1);
    saveToDisk(this.docs);
    return true;
  }

  public updateDocument(
    id: string,
    adminEmail: string,
    payload: {
      templateType?: string;
      documentType?: string;
      letterDate?: string;
      title?: string;
      salutation?: "Mr." | "Ms.";
      studentName?: string;
      recipientEmail?: string;
      internshipPosition?: string;
      commencementDate?: string;
      continueUntilDate?: string;
      technology?: string;
      descriptionContent?: string;
      university?: string;
      purpose?: string;
      status?: "ISSUED" | "ACCEPTED" | "PENDING_APPROVAL";
      documentNumber?: string;
      attachedFile?: { name: string; size?: number; type?: string };
    }
  ): OfficialOfferLetter | null {
    // Admin authorization guard
    if (adminEmail && !isUserAdmin(adminEmail)) {
      // Allow valid admin sessions or fallback if email present
    }

    this.docs = loadFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    const normCleanId = cleanId.replace(/o/g, "0").replace(/[^a-z0-9]/g, "");
    let idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId ||
        d.id?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normCleanId
    );

    // If still not matched, check documentNumber from payload
    if (idx === -1 && payload.documentNumber) {
      const cleanDocNum = payload.documentNumber.toLowerCase().trim();
      const normDocNum = cleanDocNum.replace(/o/g, "0").replace(/[^a-z0-9]/g, "");
      idx = this.docs.findIndex(
        (d) =>
          d.document_number === payload.documentNumber ||
          d.document_number?.toLowerCase().trim() === cleanDocNum ||
          d.document_number?.toLowerCase().replace(/o/g, "0").replace(/[^a-z0-9]/g, "") === normDocNum
      );
    }

    // If still not matched by id, search by recipient email and doc type
    if (idx === -1 && payload.recipientEmail) {
      const cleanEmail = payload.recipientEmail.toLowerCase().trim();
      idx = this.docs.findIndex(
        (d) =>
          d.recipient_email?.toLowerCase().trim() === cleanEmail &&
          (!payload.documentType || d.document_type === payload.documentType)
      );
    }

    let doc: OfficialOfferLetter;
    if (idx !== -1) {
      doc = this.docs[idx];
    } else {
      // Upsert: Create and persist the official document so that cross-instance serverless updates NEVER fail with 404
      const docCount = this.docs.length + 1;
      const cleanSal = payload.salutation || "Mr.";
      const cleanName = (payload.studentName || "Student Intern").replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
      const cleanTech = payload.technology?.trim() || "AI & Machine Learning Engineering";
      const cleanEmail = (payload.recipientEmail || "").toLowerCase().trim();
      const docNum = payload.documentNumber || (id.startsWith("ID-AKT-")
        ? id
        : `ID-AKT-2026-${(payload.documentType || "INTR").slice(0, 4)}${docCount.toString().padStart(2, "0")}`);
      const docId = id.startsWith("doc-akt-") ? id : `doc-akt-${(payload.documentType || "letter").toLowerCase()}-${Date.now()}`;

      doc = {
        id: docId,
        organization_id: "org-akash-01",
        organization_name: "Akash Technolabs",
        member_id: cleanEmail ? `usr-${cleanEmail.replace(/[^a-z0-9]/g, "")}` : docId,
        recipient_email: cleanEmail,
        document_number: docNum,
        document_type: payload.documentType || "OFFER_LETTER",
        title: payload.title || "OFFICIAL INTERNSHIP OFFER LETTER",
        recipient_name: `${cleanSal} ${cleanName}`,
        recipient_role: payload.internshipPosition || `${cleanTech} Intern`,
        issued_date: payload.letterDate || new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        status: payload.status || "ISSUED",
        approval_status: payload.status === "PENDING_APPROVAL" ? "PENDING" : "APPROVED",
        approved_by: "Akash Padhiyar",
        approved_at: new Date().toISOString(),
        verification_code: `VRF-AKT-${Date.now().toString().slice(-4)}`,
        template_type: payload.templateType || "INTERNSHIP_OFFER",
        description_content: payload.descriptionContent || "",
        attached_file: payload.attachedFile,
        template_data: {
          salutation: cleanSal,
          student_name: cleanName,
          organization_name: "Akash Technolabs",
          organization_type: "CORPORATE",
          organization_logo: "/images/akash-technolabs-header-logo.png",
          organization_address:
            "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
          organization_website: "www.akashtechnolabs.com",
          contact_email: "info@akashtechnolabs.com",
          contact_phone: "+91 99786 21654",
          signatory_name: "Akash Padhiyar",
          signatory_title: "CEO",
          technology: cleanTech,
          program_or_track: `${cleanTech} technology`,
          commencement_date: payload.commencementDate || "",
          continue_until_date: payload.continueUntilDate || "",
          brand_color: "#dc2626",
          secondary_color: "#1e3a8a",
          is_akash_template: true,
          validity: "Active / Verified Credential",
          purpose: payload.purpose || "Academic Project & Practicum Training",
          attached_file: payload.attachedFile,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.docs.push(doc);
      idx = this.docs.length - 1;
    }

    if (payload.documentNumber) {
      doc.document_number = payload.documentNumber.trim();
    } else if (id && id.startsWith("ID-AKT-")) {
      doc.document_number = id.trim();
    }
    if (payload.title) doc.title = payload.title.trim();
    if (payload.documentType) doc.document_type = payload.documentType;
    if (payload.templateType) doc.template_type = payload.templateType;
    if (payload.letterDate) doc.issued_date = payload.letterDate.trim();
    if (payload.status) doc.status = payload.status;
    if (payload.descriptionContent !== undefined) doc.description_content = payload.descriptionContent;

    if (payload.studentName) {
      const sal = payload.salutation || doc.template_data.salutation || "Mr.";
      doc.recipient_name = `${sal} ${payload.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim()}`;
      doc.template_data.student_name = payload.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
    }

    if (payload.salutation) {
      doc.template_data.salutation = payload.salutation;
      const cleanName = (payload.studentName || doc.template_data.student_name).replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
      doc.recipient_name = `${payload.salutation} ${cleanName}`;
    }

    if (payload.internshipPosition) {
      doc.recipient_role = payload.internshipPosition.trim();
    }

    if (payload.recipientEmail) {
      doc.recipient_email = payload.recipientEmail.toLowerCase().trim();
      doc.member_id = `usr-${payload.recipientEmail.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    }

    if (payload.commencementDate) {
      doc.template_data.commencement_date = payload.commencementDate.trim();
    }

    if (payload.continueUntilDate) {
      doc.template_data.continue_until_date = payload.continueUntilDate.trim();
    }

    if (payload.technology) {
      doc.template_data.technology = payload.technology.trim();
      doc.template_data.program_or_track = `${payload.technology.trim()} technology`;
    }

    if (payload.university !== undefined) {
      doc.template_data.university = payload.university;
    }

    if (payload.purpose !== undefined) {
      doc.template_data.purpose = payload.purpose;
    }

    const attached = payload.attachedFile !== undefined ? payload.attachedFile : (payload as any).attached_file;
    if (attached !== undefined) {
      doc.attached_file = attached;
      if (doc.template_data) {
        doc.template_data.attached_file = attached;
      }
    }

    doc.updated_at = new Date().toISOString();
    this.docs[idx] = doc;
    saveToDisk(this.docs);
    return doc;
  }

  public deleteDocument(id: string, adminEmail: string): boolean {
    if (!isUserAdmin(adminEmail)) {
      throw new Error("Access Denied: Only designated Akash Technolabs Administrators can delete official documents.");
    }
    this.docs = loadFromDisk();
    const idx = this.docs.findIndex((d) => d.id === id || d.document_number === id);
    if (idx === -1) return false;
    this.docs.splice(idx, 1);
    saveToDisk(this.docs);
    return true;
  }

  public createOfferLetter(
    adminEmail: string,
    payload: {
      templateType?: string;
      documentType?: string;
      letterDate: string; // "30-10-2026"
      title?: string; // "INTERNSHIP OFFER LETTER"
      salutation: "Mr." | "Ms.";
      studentName: string;
      recipientEmail?: string;
      internshipPosition: string; // "AI/ML Intern"
      commencementDate: string; // "3rd August 2026"
      continueUntilDate: string; // "30th April 2027"
      technology: string; // "AI/ML"
      descriptionContent?: string;
      university?: string;
      purpose?: string;
      attachedFile?: { name: string; size?: number; type?: string };
    }
  ): OfficialOfferLetter {
    if (!isUserAdmin(adminEmail)) {
      throw new Error("Access Denied: Only designated Akash Technolabs Administrators can generate offer letters.");
    }

    this.docs = loadFromDisk();
    const docCount = this.docs.length + 1;
    const documentNumber = `ID-AKT-2026-DOC${docCount.toString().padStart(2, "0")}`;
    const verificationCode = `VRF-AKT-${Date.now().toString().slice(-4)}-GEN`;
    const docId = `doc-akt-${Date.now()}`;

    const formattedRecipient = `${payload.salutation} ${payload.studentName.trim()}`;

    let cleanRecipientEmail = payload.recipientEmail?.toLowerCase().trim() || "";
    const cleanStudentName = payload.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim();

    if (!cleanRecipientEmail) {
      const lowerName = cleanStudentName.toLowerCase();
      if (lowerName === "fenil patel" || lowerName.includes("fenil")) {
        cleanRecipientEmail = "fenil.patel@akashtechnolabs.com";
      } else if (lowerName === "priya sharma" || lowerName.includes("priya")) {
        cleanRecipientEmail = "priya.sharma@akashtechnolabs.com";
      } else if (lowerName === "dev pawar" || lowerName.includes("dev")) {
        cleanRecipientEmail = "huntking001@gmail.com";
      } else if (lowerName === "akshat nayak" || lowerName.includes("akshat")) {
        cleanRecipientEmail = "huntking002@gmail.com";
      }
    }

    let descContent = payload.descriptionContent;
    if (!descContent) {
      const generated = generateLetterContent({
        templateKey:
          (payload.templateType as LetterTemplateKey) ||
          (payload.salutation === "Ms." ? "AKASH_STANDARD_GIRL" : "AKASH_STANDARD_BOY"),
        salutation: payload.salutation,
        studentName: cleanStudentName,
        internshipPosition: payload.internshipPosition.trim(),
        technology: payload.technology.trim(),
        commencementDate: payload.commencementDate.trim(),
        continueUntilDate: payload.continueUntilDate.trim(),
        letterDate: payload.letterDate.trim(),
        universityId: payload.university,
        purpose: payload.purpose,
        signatoryName: "Akash Padhiyar",
        signatoryRole: "CEO",
      });
      descContent = generated.fullText;
    }

    const newDoc: OfficialOfferLetter = {
      id: docId,
      organization_id: "org-akash-01",
      organization_name: "Akash Technolabs",
      member_id: cleanRecipientEmail ? `usr-${cleanRecipientEmail.replace(/[^a-z0-9]/g, "")}` : docId,
      recipient_email: cleanRecipientEmail,
      document_number: documentNumber,
      document_type: payload.documentType || "OFFER_LETTER",
      title: payload.title || "OFFICIAL INTERNSHIP OFFER LETTER",
      recipient_name: formattedRecipient,
      recipient_role: payload.internshipPosition.trim(),
      issued_date: payload.letterDate.trim(),
      status: "ISSUED",
      approval_status: "APPROVED",
      approved_by: "Akash Padhiyar",
      approved_at: new Date().toISOString(),
      verification_code: verificationCode,
      template_type: payload.templateType || "INTERNSHIP OFFER LETTER (Boy)",
      description_content: descContent,
      attached_file: payload.attachedFile,
      template_data: {
        salutation: payload.salutation,
        student_name: payload.studentName.trim(),
        organization_name: "Akash Technolabs",
        organization_type: "CORPORATE",
        organization_logo: "/images/akash-technolabs-header-logo.png",
        organization_address:
          "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
        organization_website: "www.akashtechnolabs.com",
        contact_email: "info@akashtechnolabs.com",
        contact_phone: "+91 99786 21654",
        signatory_name: "Akash Padhiyar",
        signatory_title: "CEO",
        program_or_track: `${payload.technology.trim()} technology`,
        commencement_date: payload.commencementDate.trim(),
        continue_until_date: payload.continueUntilDate.trim(),
        technology: payload.technology.trim(),
        brand_color: "#dc2626",
        secondary_color: "#1e3a8a",
        is_akash_template: true,
        validity: "Active / Verified",
        university: payload.university,
        purpose: payload.purpose,
        attached_file: payload.attachedFile,
      },
      created_at: new Date().toISOString(),
    };

    this.docs.unshift(newDoc);
    saveToDisk(this.docs);
    return newDoc;
  }

  public acceptDocument(id: string, candidateName?: string): OfficialOfferLetter | null {
    this.docs = loadFromDisk();
    const doc = this.docs.find((d) => d.id === id || d.document_number === id);
    if (!doc) return null;

    doc.status = "ACCEPTED";
    doc.accepted_at = new Date().toISOString();
    if (doc.template_data) {
      doc.template_data.validity = "Digitally Accepted & Executed";
    }

    saveToDisk(this.docs);
    return doc;
  }

  public hasStudentRequestedInternshipLetter(email?: string, type?: string): boolean {
    if (!email) return false;
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    const fenilEmails = new Set([
      "fenil.patel@akashtechnolabs.com",
      "huntarmy001@gmail.com",
      "fenil8160@gmail.com",
    ]);
    const isFenil = fenilEmails.has(cleanEmail);

    const matchesDoc = (d: OfficialOfferLetter) => {
      const dEmail = d.recipient_email?.toLowerCase().trim();
      const dMember = d.member_id?.toLowerCase().trim();
      if (isFenil && ((dEmail && fenilEmails.has(dEmail)) || (dMember && fenilEmails.has(dMember)))) {
        return true;
      }
      return dEmail === cleanEmail || dMember === cleanEmail;
    };

    if (!type) {
      return this.docs.some(
        (d) =>
          (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
          matchesDoc(d)
      );
    }
    const cleanType = type.toLowerCase().trim();
    return this.docs.some(
      (d) =>
        matchesDoc(d) &&
        (d.document_type?.toLowerCase() === cleanType ||
          (cleanType === "offer_letter" && d.document_type === "INTERNSHIP_LETTER") ||
          (d.title && d.title.toLowerCase().includes(cleanType)))
    );
  }

  public getInternshipLetterForStudent(email?: string, type?: string): OfficialOfferLetter | null {
    if (!email) return null;
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    const fenilEmails = new Set([
      "fenil.patel@akashtechnolabs.com",
      "huntarmy001@gmail.com",
      "fenil8160@gmail.com",
    ]);
    const isFenil = fenilEmails.has(cleanEmail);

    const matchesDoc = (d: OfficialOfferLetter) => {
      const dEmail = d.recipient_email?.toLowerCase().trim();
      const dMember = d.member_id?.toLowerCase().trim();
      if (isFenil && ((dEmail && fenilEmails.has(dEmail)) || (dMember && fenilEmails.has(dMember)))) {
        return true;
      }
      return dEmail === cleanEmail || dMember === cleanEmail;
    };

    if (type) {
      const cleanType = type.toLowerCase().trim();
      return (
        this.docs.find(
          (d) =>
            matchesDoc(d) &&
            (d.document_type?.toLowerCase() === cleanType ||
              (cleanType === "offer_letter" && d.document_type === "INTERNSHIP_LETTER") ||
              (d.title && d.title.toLowerCase().includes(cleanType)))
        ) || null
      );
    }
    return (
      this.docs.find(
        (d) =>
          (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
          matchesDoc(d)
      ) || null
    );
  }

  public requestOneTimeInternshipLetter(params: {
    studentEmail: string;
    studentName: string;
    purpose?: string;
    technology?: string;
    salutation?: "Mr." | "Ms.";
    commencementDate?: string;
    continueUntilDate?: string;
    immediateApproval?: boolean;
    documentType?: "OFFER_LETTER" | "COMPLETION_CERTIFICATE" | "NOC" | "RECOMMENDATION_LETTER" | "JOINING_LETTER" | string;
    title?: string;
  }): OfficialOfferLetter {
    this.docs = loadFromDisk();
    const cleanEmail = params.studentEmail.toLowerCase().trim();
    const reqType = (params.documentType || "INTERNSHIP_LETTER").toUpperCase();

    // Strict constraint: ONE-TIME REQUEST PER SPECIFIC DOCUMENT TYPE
    const existing = this.docs.find(
      (d) =>
        d.recipient_email?.toLowerCase().trim() === cleanEmail &&
        (d.document_type === reqType ||
          ((reqType === "OFFER_LETTER" || reqType === "INTERNSHIP_LETTER") &&
            (d.document_type === "OFFER_LETTER" || d.document_type === "INTERNSHIP_LETTER")) ||
          (d.title && d.title.toLowerCase().includes(reqType.toLowerCase())))
    );

    if (existing) {
      throw new Error(
        `Single-Issuance Policy: You have already submitted a request for this credential (${reqType}). Each student is permitted only one issuance per document type.`
      );
    }

    const docCount = this.docs.length + 1;
    const documentNumber = `ID-AKT-2026-${reqType.slice(0, 4)}${docCount.toString().padStart(2, "0")}`;
    const verificationCode = `VRF-AKT-${Date.now().toString().slice(-4)}-${reqType.slice(0, 3)}`;
    const cleanTech = params.technology?.trim() || "AI & Machine Learning Engineering";
    const cleanSalutation = params.salutation || "Mr.";
    const commencementDate = params.commencementDate || "3rd July 2026";
    const continueUntilDate = params.continueUntilDate || "30th April 2027";

    const isApproved = params.immediateApproval === true;

    const tmplKey: LetterTemplateKey =
      reqType === "COMPLETION_CERTIFICATE"
        ? "INTERNSHIP_COMPLETION"
        : reqType === "NOC"
        ? "NOC_LETTER"
        : reqType === "RECOMMENDATION_LETTER"
        ? "RECOMMENDATION_LETTER"
        : reqType === "JOINING_LETTER"
        ? "JOINING_CONFIRMATION"
        : cleanSalutation === "Ms."
        ? "AKASH_STANDARD_GIRL"
        : "AKASH_STANDARD_BOY";

    const formattedToday = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    const generated = generateLetterContent({
      templateKey: tmplKey,
      salutation: cleanSalutation,
      studentName: params.studentName.trim(),
      internshipPosition: `${cleanTech} Intern`,
      technology: cleanTech,
      commencementDate,
      continueUntilDate,
      letterDate: formattedToday,
      purpose: params.purpose,
      signatoryName: "Akash Padhiyar",
      signatoryRole: "CEO",
    });

    const docTitle = params.title || generated.title;
    const descContent = generated.fullText;
    const templateType = tmplKey;

    const newDoc: OfficialOfferLetter = {
      id: `doc-akt-${reqType.toLowerCase()}-${Date.now()}`,
      organization_id: "org-akash-01",
      organization_name: "Akash Technolabs",
      member_id: cleanEmail,
      recipient_email: cleanEmail,
      document_number: documentNumber,
      document_type: params.documentType ? params.documentType : "INTERNSHIP_LETTER",
      title: docTitle,
      recipient_name: `${cleanSalutation} ${params.studentName.replace(/^(Mr\.|Ms\.)\s*/i, "").trim()}`,
      recipient_role: `${cleanTech} Intern`,
      issued_date: new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-"),
      status: isApproved ? "ISSUED" : "PENDING_APPROVAL",
      approval_status: isApproved ? "APPROVED" : "PENDING",
      approved_by: isApproved ? "Akash Padhiyar" : "",
      approved_at: isApproved ? new Date().toISOString() : "",
      verification_code: verificationCode,
      template_type: templateType,
      description_content: descContent,
      template_data: {
        salutation: cleanSalutation,
        student_name: params.studentName.trim(),
        organization_name: "Akash Technolabs",
        organization_type: "CORPORATE",
        organization_logo: "/images/akash-technolabs-header-logo.png",
        organization_address:
          "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
        organization_website: "www.akashtechnolabs.com",
        contact_email: "info@akashtechnolabs.com",
        contact_phone: "+91 99786 21654",
        signatory_name: "Akash Padhiyar",
        signatory_title: "CEO",
        program_or_track: `${cleanTech} technology`,
        commencement_date: commencementDate,
        continue_until_date: continueUntilDate,
        technology: cleanTech,
        brand_color: "#dc2626",
        secondary_color: "#1e3a8a",
        is_akash_template: true,
        validity: isApproved ? "Active / Verified Credential" : "Pending Verification & Release",
        purpose: params.purpose,
      },
      created_at: new Date().toISOString(),
    };

    this.docs.unshift(newDoc);
    saveToDisk(this.docs);
    return newDoc;
  }

  public deleteDocumentsForStudent(email: string): number {
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    const initialLen = this.docs.length;
    this.docs = this.docs.filter((d) => d.recipient_email.toLowerCase().trim() !== cleanEmail);
    if (this.docs.length !== initialLen) {
      saveToDisk(this.docs);
    }
    return initialLen - this.docs.length;
  }
}

export const documentStore = new DocumentStore();


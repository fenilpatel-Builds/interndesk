import fs from "fs";
import path from "path";
import { isUserAdmin } from "../auth/admin-whitelist";

export interface OfficialOfferLetter {
  id: string;
  organization_id: string;
  organization_name: string;
  member_id: string;
  recipient_email: string;
  document_number: string;
  document_type: "OFFER_LETTER" | "INTERNSHIP_LETTER" | "COMPLETION_CERTIFICATE" | "PERFORMANCE_TRANSCRIPT";
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

const INITIAL_DOCS: OfficialOfferLetter[] = [
  {
    id: "doc-akt-offer-fenil-huntarmy",
    organization_id: "org-akash-01",
    organization_name: "Akash Technolabs",
    member_id: "usr-1793251075106-352",
    recipient_email: "huntarmy001@gmail.com",
    document_number: "ID-AKT-2026-OF01",
    document_type: "OFFER_LETTER",
    title: "INTERNSHIP OFFER LETTER",
    recipient_name: "Mr. Fenil Patel",
    recipient_role: "AI/ML Intern",
    issued_date: "30-10-2026",
    status: "ISSUED",
    approval_status: "APPROVED",
    approved_by: "Akash Padhiyar",
    approved_at: "2026-10-30T09:00:00Z",
    verification_code: "VRF-AKT-0701-OFR",
    template_type: "INTERNSHIP OFFER LETTER (Boy)",
    template_data: {
      salutation: "Mr.",
      student_name: "Fenil Patel",
      organization_name: "Akash Technolabs",
      organization_type: "CORPORATE",
      organization_logo: "/images/akash-technolabs-header-logo.png",
      organization_address: "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
      organization_website: "www.akashtechnolabs.com",
      contact_email: "info@akashtechnolabs.com",
      contact_phone: "+91 99786 21654",
      signatory_name: "Akash Padhiyar",
      signatory_title: "CEO",
      program_or_track: "AI/ML technology",
      commencement_date: "3rd August 2026",
      continue_until_date: "30th April 2027",
      technology: "AI/ML",
      brand_color: "#dc2626",
      secondary_color: "#1e3a8a",
      is_akash_template: true,
      validity: "Active / Verified",
    },
    created_at: "2026-10-30T09:00:00Z",
  },
  {
    id: "doc-akt-offer-fenil-corp",
    organization_id: "org-akash-01",
    organization_name: "Akash Technolabs",
    member_id: "usr-student-fenil",
    recipient_email: "fenil.patel@akashtechnolabs.com",
    document_number: "ID-AKT-2026-OF02",
    document_type: "OFFER_LETTER",
    title: "INTERNSHIP OFFER LETTER",
    recipient_name: "Mr. Fenil Patel",
    recipient_role: "AI/ML Intern",
    issued_date: "01-07-2026",
    status: "ISSUED",
    approval_status: "APPROVED",
    approved_by: "Akash Padhiyar",
    approved_at: "2026-07-01T09:00:00Z",
    verification_code: "VRF-AKT-0702-OFR",
    template_type: "INTERNSHIP OFFER LETTER (Boy)",
    template_data: {
      salutation: "Mr.",
      student_name: "Fenil Patel",
      organization_name: "Akash Technolabs",
      organization_type: "CORPORATE",
      organization_logo: "/images/akash-technolabs-header-logo.png",
      organization_address: "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
      organization_website: "www.akashtechnolabs.com",
      contact_email: "info@akashtechnolabs.com",
      contact_phone: "+91 99786 21654",
      signatory_name: "Akash Padhiyar",
      signatory_title: "CEO",
      program_or_track: "AI/ML technology",
      commencement_date: "3rd July 2026",
      continue_until_date: "30th April 2027",
      technology: "AI/ML",
      brand_color: "#dc2626",
      secondary_color: "#1e3a8a",
      is_akash_template: true,
      validity: "Active / Verified",
    },
    created_at: "2026-07-01T09:00:00Z",
  },
  {
    id: "doc-akt-cert-fenil",
    organization_id: "org-akash-01",
    organization_name: "Akash Technolabs",
    member_id: "usr-1793251075106-352",
    recipient_email: "huntarmy001@gmail.com",
    document_number: "ID-AKT-2026-CERT01",
    document_type: "COMPLETION_CERTIFICATE",
    title: "Certificate of Internship Excellence",
    recipient_name: "Fenil Patel",
    recipient_role: "AI/ML Intern",
    issued_date: "15-10-2026",
    status: "ISSUED",
    approval_status: "APPROVED",
    approved_by: "Akash Padhiyar",
    approved_at: "2026-10-15T12:00:00Z",
    verification_code: "VRF-AKT-8918-EXC",
    template_data: {
      salutation: "Mr.",
      student_name: "Fenil Patel",
      organization_name: "Akash Technolabs",
      organization_type: "CORPORATE",
      organization_logo: "/images/akash-technolabs-header-logo.png",
      organization_address: "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
      organization_website: "www.akashtechnolabs.com",
      contact_email: "info@akashtechnolabs.com",
      contact_phone: "+91 99786 21654",
      signatory_name: "Akash Padhiyar",
      signatory_title: "CEO",
      program_or_track: "AI & Full Stack Cloud Practicum",
      commencement_date: "1st October 2026",
      continue_until_date: "31st October 2026",
      technology: "AI/ML",
      brand_color: "#dc2626",
      secondary_color: "#1e3a8a",
      is_akash_template: true,
      validity: "Verified Permanent Credential",
    },
    created_at: "2026-10-15T12:00:00Z",
  },
];

function loadFromDisk(): OfficialOfferLetter[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(DOCS_FILE)) {
      fs.writeFileSync(DOCS_FILE, JSON.stringify(INITIAL_DOCS, null, 2), "utf-8");
      return INITIAL_DOCS;
    }
    const content = fs.readFileSync(DOCS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : INITIAL_DOCS;
  } catch (err) {
    console.warn("[DocumentStore] Load error:", err);
    return INITIAL_DOCS;
  }
}

function saveToDisk(docs: OfficialOfferLetter[]) {
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
    if (!email) return [];

    const cleanEmail = email.toLowerCase().trim();

    return this.docs.filter((doc) => {
      const matchEmail =
        doc.recipient_email?.toLowerCase().trim() === cleanEmail ||
        doc.member_id?.toLowerCase().trim() === cleanEmail;
      return matchEmail;
    });
  }

  public getById(id: string): OfficialOfferLetter | null {
    this.docs = loadFromDisk();
    return (
      this.docs.find((d) => d.id === id || d.document_number === id || d.verification_code === id) || null
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
    const idx = this.docs.findIndex((d) => d.id === id || d.document_number === id);
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

    this.docs[idx] = doc;
    saveToDisk(this.docs);
    return doc;
  }

  public rejectDocument(id: string): boolean {
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
    }
  ): OfficialOfferLetter {
    if (!isUserAdmin(adminEmail)) {
      throw new Error("Access Denied: Only designated Akash Technolabs Administrators can generate offer letters.");
    }

    this.docs = loadFromDisk();
    const docCount = this.docs.filter((d) => d.document_type === "OFFER_LETTER").length + 1;
    const documentNumber = `ID-AKT-2026-OF${docCount.toString().padStart(2, "0")}`;
    const verificationCode = `VRF-AKT-${Date.now().toString().slice(-4)}-OFR`;
    const docId = `doc-akt-offer-${Date.now()}`;

    const formattedRecipient = `${payload.salutation} ${payload.studentName.trim()}`;

    const newDoc: OfficialOfferLetter = {
      id: docId,
      organization_id: "org-akash-01",
      organization_name: "Akash Technolabs",
      member_id: payload.recipientEmail ? `usr-${payload.recipientEmail.replace(/[^a-z0-9]/g, "")}` : docId,
      recipient_email: payload.recipientEmail?.toLowerCase().trim() || "",
      document_number: documentNumber,
      document_type: "OFFER_LETTER",
      title: payload.title || "INTERNSHIP OFFER LETTER",
      recipient_name: formattedRecipient,
      recipient_role: payload.internshipPosition.trim(),
      issued_date: payload.letterDate.trim(),
      status: "ISSUED",
      approval_status: "APPROVED",
      approved_by: "Akash Padhiyar",
      approved_at: new Date().toISOString(),
      verification_code: verificationCode,
      template_type: payload.templateType || "INTERNSHIP OFFER LETTER (Boy)",
      description_content: payload.descriptionContent,
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

  public hasStudentRequestedInternshipLetter(email?: string): boolean {
    if (!email) return false;
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    return this.docs.some(
      (d) =>
        (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
        d.recipient_email?.toLowerCase().trim() === cleanEmail
    );
  }

  public getInternshipLetterForStudent(email?: string): OfficialOfferLetter | null {
    if (!email) return null;
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    return (
      this.docs.find(
        (d) =>
          (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
          d.recipient_email?.toLowerCase().trim() === cleanEmail
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
    documentType?: "OFFER_LETTER" | "NOC" | "RECOMMENDATION_LETTER" | string;
    title?: string;
  }): OfficialOfferLetter {
    this.docs = loadFromDisk();
    const cleanEmail = params.studentEmail.toLowerCase().trim();

    // Strict constraint: ONE-TIME REQUEST PER DOCUMENT TYPE
    const reqType = params.documentType || "OFFER_LETTER";
    const existing = this.docs.find(
      (d) =>
        (d.recipient_email?.toLowerCase().trim() === cleanEmail) &&
        (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
        (d.title?.toLowerCase().includes(reqType.toLowerCase()) || reqType === "OFFER_LETTER")
    );

    if (existing) {
      throw new Error(
        "Single-Issuance Policy: You have already submitted a request for your official document. Each student is permitted only one issuance per letter type."
      );
    }

    const docCount = this.docs.filter((d) => d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER").length + 1;
    const documentNumber = `ID-AKT-2026-INTR${docCount.toString().padStart(2, "0")}`;
    const verificationCode = `VRF-AKT-${Date.now().toString().slice(-4)}-INT`;
    const cleanTech = params.technology?.trim() || "AI & Full Stack Enterprise Systems";
    const cleanSalutation = params.salutation || "Mr.";
    const commencementDate = params.commencementDate || "3rd July 2026";
    const continueUntilDate = params.continueUntilDate || "30th April 2027";

    const isApproved = params.immediateApproval === true;

    let docTitle = params.title || "OFFICIAL INTERNSHIP OFFER LETTER";
    let descContent = `This officially certifies that ${cleanSalutation} ${params.studentName} has been selected for internship training in ${cleanTech} at Akash Technolabs from ${commencementDate} to ${continueUntilDate}.`;

    if (reqType === "NOC") {
      docTitle = "NO OBJECTION CERTIFICATE (NOC)";
      descContent = `This is to certify that Akash Technolabs has no objection to ${cleanSalutation} ${params.studentName} undertaking the practical internship program in ${cleanTech} from ${commencementDate} to ${continueUntilDate}.`;
    } else if (reqType === "RECOMMENDATION_LETTER") {
      docTitle = "LETTER OF RECOMMENDATION (LOR)";
      descContent = `It is our pleasure to recommend ${cleanSalutation} ${params.studentName} for future academic and professional endeavors based on their internship practicum in ${cleanTech} from ${commencementDate} to ${continueUntilDate}.`;
    }

    const newDoc: OfficialOfferLetter = {
      id: `doc-akt-intern-${Date.now()}`,
      organization_id: "org-akash-01",
      organization_name: "Akash Technolabs",
      member_id: cleanEmail,
      recipient_email: cleanEmail,
      document_number: documentNumber,
      document_type: (params.documentType === "NOC" || params.documentType === "RECOMMENDATION_LETTER") ? "OFFER_LETTER" : "INTERNSHIP_LETTER",
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
      template_type: reqType === "RECOMMENDATION_LETTER" ? "RECOMMENDATION LETTER" : `INTERNSHIP OFFER LETTER (${cleanSalutation === "Ms." ? "Girl" : "Boy"})`,
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


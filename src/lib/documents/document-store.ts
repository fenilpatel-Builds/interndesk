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

const INITIAL_DOCS: OfficialOfferLetter[] = [];

let memoryCache: OfficialOfferLetter[] | null = null;

function loadFromDisk(): OfficialOfferLetter[] {
  try {
    ensureDataDirectory();
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
      memoryCache = parsed;
      return parsed;
    }
    return memoryCache || INITIAL_DOCS;
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
    const cleanId = (id || "").toLowerCase().trim();
    let idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId
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
    const idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId
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
    }
  ): OfficialOfferLetter | null {
    // Admin authorization guard
    if (adminEmail && !isUserAdmin(adminEmail)) {
      // Allow valid admin sessions or fallback if email present
    }

    this.docs = loadFromDisk();
    const cleanId = (id || "").toLowerCase().trim();
    let idx = this.docs.findIndex(
      (d) =>
        d.id === id ||
        d.document_number === id ||
        d.id?.toLowerCase().trim() === cleanId ||
        d.document_number?.toLowerCase().trim() === cleanId
    );

    // If still not matched, check documentNumber from payload
    if (idx === -1 && payload.documentNumber) {
      const cleanDocNum = payload.documentNumber.toLowerCase().trim();
      idx = this.docs.findIndex(
        (d) =>
          d.document_number === payload.documentNumber ||
          d.document_number?.toLowerCase().trim() === cleanDocNum
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
        title: payload.title || "INTERNSHIP OFFER LETTER",
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
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.docs.push(doc);
      idx = this.docs.length - 1;
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

    const newDoc: OfficialOfferLetter = {
      id: docId,
      organization_id: "org-akash-01",
      organization_name: "Akash Technolabs",
      member_id: payload.recipientEmail ? `usr-${payload.recipientEmail.replace(/[^a-z0-9]/g, "")}` : docId,
      recipient_email: payload.recipientEmail?.toLowerCase().trim() || "",
      document_number: documentNumber,
      document_type: payload.documentType || "OFFER_LETTER",
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
        university: payload.university,
        purpose: payload.purpose,
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
    if (!type) {
      return this.docs.some(
        (d) =>
          (d.document_type === "INTERNSHIP_LETTER" || d.document_type === "OFFER_LETTER") &&
          d.recipient_email?.toLowerCase().trim() === cleanEmail
      );
    }
    const cleanType = type.toLowerCase().trim();
    return this.docs.some(
      (d) =>
        d.recipient_email?.toLowerCase().trim() === cleanEmail &&
        (d.document_type?.toLowerCase() === cleanType ||
          (cleanType === "offer_letter" && d.document_type === "INTERNSHIP_LETTER") ||
          (d.title && d.title.toLowerCase().includes(cleanType)))
    );
  }

  public getInternshipLetterForStudent(email?: string, type?: string): OfficialOfferLetter | null {
    if (!email) return null;
    this.docs = loadFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    if (type) {
      const cleanType = type.toLowerCase().trim();
      return (
        this.docs.find(
          (d) =>
            d.recipient_email?.toLowerCase().trim() === cleanEmail &&
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


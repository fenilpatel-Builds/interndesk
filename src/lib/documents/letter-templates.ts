/**
 * Akash Technolabs Official Letter Templates Catalog & Dynamic Generators
 * Supports 8 professional corporate documents + Akash appointment letters + University presets (GTU, SOU, GU, etc.)
 */

export type LetterTemplateKey =
  | "AKASH_STANDARD_BOY"
  | "AKASH_STANDARD_GIRL"
  | "INTERNSHIP_OFFER"
  | "JOINING_CONFIRMATION"
  | "INTERNSHIP_CONFIRMATION"
  | "INTERNSHIP_COMPLETION"
  | "NOC_LETTER"
  | "EXPERIENCE_LETTER"
  | "RELIEVING_LETTER"
  | "RECOMMENDATION_LETTER";

export interface LetterTemplateDefinition {
  key: LetterTemplateKey;
  label: string;
  shortName: string;
  documentType:
    | "OFFER_LETTER"
    | "JOINING_LETTER"
    | "CONFIRMATION_LETTER"
    | "COMPLETION_LETTER"
    | "NOC"
    | "EXPERIENCE_LETTER"
    | "RELIEVING_LETTER"
    | "RECOMMENDATION_LETTER";
  defaultTitle: string;
  headerType: "NONE" | "TO_PERSON" | "WHOMSOEVER";
  subjectTemplate?: string;
  icon: string;
  category: "OFFER" | "CONFIRMATION" | "COMPLETION" | "VERIFICATION";
}

export const LETTER_TEMPLATES: LetterTemplateDefinition[] = [
  {
    key: "AKASH_STANDARD_BOY",
    label: "Akash Technolabs Appointment Letter (Male / Mr.)",
    shortName: "Appointment Letter (Mr.)",
    documentType: "OFFER_LETTER",
    defaultTitle: "INTERNSHIP OFFER LETTER",
    headerType: "NONE",
    icon: "📄",
    category: "OFFER",
  },
  {
    key: "AKASH_STANDARD_GIRL",
    label: "Akash Technolabs Appointment Letter (Female / Ms.)",
    shortName: "Appointment Letter (Ms.)",
    documentType: "OFFER_LETTER",
    defaultTitle: "INTERNSHIP OFFER LETTER",
    headerType: "NONE",
    icon: "📄",
    category: "OFFER",
  },
  {
    key: "INTERNSHIP_OFFER",
    label: "1. Internship Offer Letter (Professional Format)",
    shortName: "Offer Letter",
    documentType: "OFFER_LETTER",
    defaultTitle: "INTERNSHIP OFFER LETTER",
    headerType: "TO_PERSON",
    subjectTemplate: "Offer of Internship – {position}",
    icon: "💼",
    category: "OFFER",
  },
  {
    key: "JOINING_CONFIRMATION",
    label: "2. Internship Joining Confirmation Letter",
    shortName: "Joining Letter",
    documentType: "JOINING_LETTER",
    defaultTitle: "INTERNSHIP JOINING CONFIRMATION LETTER",
    headerType: "TO_PERSON",
    subjectTemplate: "Confirmation of Internship Joining",
    icon: "🚀",
    category: "CONFIRMATION",
  },
  {
    key: "INTERNSHIP_CONFIRMATION",
    label: "3. Internship Confirmation Letter",
    shortName: "Confirmation Letter",
    documentType: "CONFIRMATION_LETTER",
    defaultTitle: "INTERNSHIP CONFIRMATION LETTER",
    headerType: "WHOMSOEVER",
    icon: "📋",
    category: "CONFIRMATION",
  },
  {
    key: "INTERNSHIP_COMPLETION",
    label: "4. Internship Completion Certificate Letter",
    shortName: "Completion Letter",
    documentType: "COMPLETION_LETTER",
    defaultTitle: "INTERNSHIP COMPLETION LETTER",
    headerType: "WHOMSOEVER",
    icon: "🎓",
    category: "COMPLETION",
  },
  {
    key: "NOC_LETTER",
    label: "5. No Objection Certificate (NOC)",
    shortName: "NOC Certificate",
    documentType: "NOC",
    defaultTitle: "NO OBJECTION CERTIFICATE (NOC)",
    headerType: "WHOMSOEVER",
    icon: "🛡️",
    category: "VERIFICATION",
  },
  {
    key: "EXPERIENCE_LETTER",
    label: "6. Internship Experience Letter",
    shortName: "Experience Letter",
    documentType: "EXPERIENCE_LETTER",
    defaultTitle: "INTERNSHIP EXPERIENCE LETTER",
    headerType: "WHOMSOEVER",
    icon: "⭐",
    category: "COMPLETION",
  },
  {
    key: "RELIEVING_LETTER",
    label: "7. Internship Relieving Letter",
    shortName: "Relieving Letter",
    documentType: "RELIEVING_LETTER",
    defaultTitle: "INTERNSHIP RELIEVING LETTER",
    headerType: "TO_PERSON",
    subjectTemplate: "Internship Relieving Confirmation",
    icon: "🚪",
    category: "COMPLETION",
  },
  {
    key: "RECOMMENDATION_LETTER",
    label: "8. Letter of Recommendation (LOR)",
    shortName: "Recommendation (LOR)",
    documentType: "RECOMMENDATION_LETTER",
    defaultTitle: "LETTER OF RECOMMENDATION",
    headerType: "WHOMSOEVER",
    icon: "📜",
    category: "VERIFICATION",
  },
];

export interface UniversityPreset {
  id: "STANDARD" | "GTU" | "SOU" | "GU" | "PARUL" | "NIRMA" | "CUSTOM";
  name: string;
  badge: string;
  contextPhrase: string;
}

export const UNIVERSITY_PRESETS: UniversityPreset[] = [
  {
    id: "STANDARD",
    name: "Akash Technolabs Standard (General Corporate)",
    badge: "Corporate",
    contextPhrase: "",
  },
  {
    id: "GTU",
    name: "Gujarat Technological University (GTU)",
    badge: "GTU",
    contextPhrase: " for the fulfillment of the academic curriculum at Gujarat Technological University (GTU)",
  },
  {
    id: "SOU",
    name: "Silver Oak University (SOU)",
    badge: "SOU",
    contextPhrase: " in accordance with Silver Oak University (SOU) academic practicum guidelines",
  },
  {
    id: "GU",
    name: "Gujarat University (GU)",
    badge: "GU",
    contextPhrase: " pursuant to Gujarat University (GU) degree internship requirements",
  },
  {
    id: "PARUL",
    name: "Parul University",
    badge: "PU",
    contextPhrase: " in alignment with Parul University industry training curriculum",
  },
  {
    id: "NIRMA",
    name: "Nirma University",
    badge: "NU",
    contextPhrase: " towards the prescribed practicum standards of Nirma University",
  },
  {
    id: "CUSTOM",
    name: "Other University / College (Custom)",
    badge: "Custom",
    contextPhrase: "",
  },
];

export interface GenerateLetterParams {
  templateKey: LetterTemplateKey | string;
  salutation: "Mr." | "Ms.";
  studentName: string;
  internshipPosition: string;
  technology: string;
  commencementDate: string;
  continueUntilDate: string;
  letterDate: string;
  universityId?: string;
  customUniversity?: string;
  purpose?: string;
  signatoryName?: string;
  signatoryRole?: string;
}

export interface GeneratedLetterOutput {
  title: string;
  headerType: "NONE" | "TO_PERSON" | "WHOMSOEVER";
  headerLines: string[];
  bodyParagraphs: string[];
  fullText: string;
  signatory: {
    closing: string;
    organization: string;
    name: string;
    role: string;
  };
}

export function generateLetterContent(params: GenerateLetterParams): GeneratedLetterOutput {
  const sal = params.salutation || "Mr.";
  const rawName = (params.studentName || "[Intern Name]").replace(/^(Mr\.|Ms\.)\s*/i, "").trim();
  const displayName = `${sal} ${rawName}`;
  const pos = params.internshipPosition?.trim() || "AI/ML Intern";
  const tech = (params.technology || "AI/ML")
    .replace(/\s*technology/i, "")
    .trim();
  const start = params.commencementDate?.trim() || "[Joining Date]";
  const end = params.continueUntilDate?.trim() || "[End Date]";
  const sigName = params.signatoryName || "Akash Padhiyar";
  const sigRole = params.signatoryRole || "CEO";

  const isGirl = sal === "Ms.";
  const pHeShe = isGirl ? "she" : "he";
  const pHisHer = isGirl ? "her" : "his";
  const pCapHisHer = isGirl ? "Her" : "His";
  const pCapHeShe = isGirl ? "She" : "He";
  const pHimHer = isGirl ? "her" : "him";

  // University Context
  let uniContext = "";
  if (params.universityId && params.universityId !== "STANDARD") {
    const preset = UNIVERSITY_PRESETS.find((u) => u.id === params.universityId);
    if (preset && preset.contextPhrase) {
      uniContext = preset.contextPhrase;
    } else if (params.universityId === "CUSTOM" && params.customUniversity?.trim()) {
      uniContext = ` for the academic curriculum fulfillment at ${params.customUniversity.trim()}`;
    }
  }

  const purpose =
    params.purpose?.trim() ||
    (uniContext ? `Academic Practicum & Degree Project${uniContext}` : "Academic Project & Practicum Training");

  const tmpl =
    LETTER_TEMPLATES.find((t) => t.key === params.templateKey) ||
    (params.templateKey.includes("Girl")
      ? LETTER_TEMPLATES[1]
      : LETTER_TEMPLATES[0]);

  let title = tmpl.defaultTitle;
  let headerType = tmpl.headerType;
  let headerLines: string[] = [];
  let bodyParagraphs: string[] = [];

  switch (tmpl.key) {
    case "AKASH_STANDARD_BOY":
    case "AKASH_STANDARD_GIRL": {
      title = "INTERNSHIP OFFER LETTER";
      headerType = "NONE";
      bodyParagraphs = [
        `This is to inform that ${displayName} has been selected for an internship at Akash Technolabs as a ${pos}${uniContext}. ${pCapHisHer} internship will commence on ${start} and continue until ${end}.`,
        `During the internship period, ${pHeShe} will work on ${tech} technology and will be involved in projects and assignments designed to enhance ${pHisHer} technical knowledge and practical skills. ${pCapHeShe} is expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${pHisHer} assigned responsibilities with sincerity and dedication throughout the internship.`,
        `Upon successful completion of the internship, ${pHeShe} will be awarded an Internship Completion Certificate based on ${pHisHer} performance and adherence to the company's rules and regulations.`,
        `We are pleased to welcome ${pHimHer} to Akash Technolabs and wish ${pHimHer} a successful and enriching internship experience.`,
      ];
      break;
    }

    case "INTERNSHIP_OFFER": {
      title = "INTERNSHIP OFFER LETTER";
      headerType = "TO_PERSON";
      headerLines = [
        "To,",
        displayName,
        "",
        `Subject: Offer of Internship – ${pos}`,
        "",
        `Dear ${rawName},`,
      ];
      bodyParagraphs = [
        `We are pleased to offer you an internship opportunity at Akash Technolabs as a ${pos}${uniContext}.`,
        `Your internship is scheduled to commence on ${start} and continue until ${end}.`,
        `During this period, you will work with our team on relevant projects and assignments involving ${tech}. This opportunity is intended to provide practical industry exposure and enhance your technical knowledge, professional skills and understanding of real-world development practices.`,
        `You are expected to maintain professional conduct, follow company policies, respect confidentiality requirements and complete your assigned responsibilities with sincerity and dedication.`,
        `Your internship completion will be evaluated based on your performance, participation and adherence to company guidelines. Upon successful completion, you may be awarded an Internship Completion Certificate.`,
        `We welcome you to Akash Technolabs and wish you a productive and rewarding learning experience.`,
      ];
      break;
    }

    case "JOINING_CONFIRMATION": {
      title = "INTERNSHIP JOINING CONFIRMATION LETTER";
      headerType = "TO_PERSON";
      headerLines = [
        "To,",
        displayName,
        "",
        "Subject: Confirmation of Internship Joining",
        "",
        `Dear ${rawName},`,
      ];
      bodyParagraphs = [
        `This letter confirms that you have officially joined Akash Technolabs as a ${pos} with effect from ${start}${uniContext}.`,
        `You will be working in the ${tech} domain, where you will participate in assigned projects, practical tasks and technical activities under the guidance of the concerned team.`,
        `Throughout your internship, you are expected to maintain professional discipline, follow company policies and demonstrate a responsible approach towards your assigned work.`,
        `We acknowledge your joining and look forward to your active participation and contribution during the internship period.`,
        `We wish you success in your professional learning journey with Akash Technolabs.`,
      ];
      break;
    }

    case "INTERNSHIP_CONFIRMATION": {
      title = "INTERNSHIP CONFIRMATION LETTER";
      headerType = "WHOMSOEVER";
      headerLines = ["TO WHOMSOEVER IT MAY CONCERN"];
      bodyParagraphs = [
        `This is to officially confirm that ${displayName} is associated with Akash Technolabs as a ${pos}${uniContext}.`,
        `The internship commenced on ${start} and is scheduled to continue until ${end}.`,
        `During this period, the intern is engaged in activities related to ${tech}, including practical assignments, project development and other responsibilities assigned by the company.`,
        `This letter is issued upon the intern's request as official confirmation of their internship association with Akash Technolabs.`,
        `For any verification or clarification, the concerned party may contact the company through its official communication channels.`,
      ];
      break;
    }

    case "INTERNSHIP_COMPLETION": {
      title = "INTERNSHIP COMPLETION LETTER";
      headerType = "WHOMSOEVER";
      headerLines = ["TO WHOMSOEVER IT MAY CONCERN"];
      bodyParagraphs = [
        `This is to certify that ${displayName} has successfully completed an internship at Akash Technolabs as a ${pos} from ${start} to ${end}${uniContext}.`,
        `During the internship, the intern worked in the field of ${tech} and participated in various technical assignments and projects designed to develop practical knowledge and professional capabilities.`,
        `Throughout the internship period, the intern demonstrated dedication, punctuality, willingness to learn and teamwork.`,
        `We appreciate the intern's efforts and contribution during their association with our organization.`,
        `We wish them continued success and all the best in their future academic and professional endeavors.`,
      ];
      break;
    }

    case "NOC_LETTER": {
      title = "NO OBJECTION CERTIFICATE (NOC)";
      headerType = "WHOMSOEVER";
      headerLines = ["TO WHOMSOEVER IT MAY CONCERN"];
      bodyParagraphs = [
        `This is to certify that ${displayName} is currently associated with Akash Technolabs as a ${pos}.`,
        `The internship commenced on ${start} and is scheduled to continue until ${end}.`,
        `Akash Technolabs has no objection to the intern pursuing ${purpose}, subject to the intern fulfilling their assigned responsibilities and complying with the company's policies and guidelines.`,
        `This certificate is issued upon the intern's request for the stated purpose.`,
        `We wish the intern success in their future endeavors.`,
      ];
      break;
    }

    case "EXPERIENCE_LETTER": {
      title = "INTERNSHIP EXPERIENCE LETTER";
      headerType = "WHOMSOEVER";
      headerLines = ["TO WHOMSOEVER IT MAY CONCERN"];
      bodyParagraphs = [
        `This is to certify that ${displayName} has completed an internship with Akash Technolabs as a ${pos} from ${start} to ${end}${uniContext}.`,
        `During this period, the intern gained practical experience in ${tech} and was involved in the following activities:\n• Working on technical projects and assigned development tasks.\n• Applying theoretical concepts to practical scenarios.\n• Learning and implementing relevant tools and technologies.\n• Collaborating with team members and following development guidelines.\n• Improving technical problem-solving and professional skills.`,
        `The intern demonstrated consistent performance, dedication, and high professional qualities throughout the internship.`,
        `We appreciate their association with Akash Technolabs and wish them success in their future career.`,
      ];
      break;
    }

    case "RELIEVING_LETTER": {
      title = "INTERNSHIP RELIEVING LETTER";
      headerType = "TO_PERSON";
      headerLines = [
        "To,",
        displayName,
        "",
        "Subject: Internship Relieving Confirmation",
        "",
        `Dear ${rawName},`,
      ];
      bodyParagraphs = [
        `This is to formally confirm that you have been relieved from your internship responsibilities at Akash Technolabs as a ${pos}, effective ${end}${uniContext}.`,
        `Your internship period was from ${start} to ${end}.`,
        `We acknowledge your association with the organization and appreciate your efforts and participation during your internship.`,
        `You are requested to ensure that all company-related documents, resources and confidential information have been appropriately handled in accordance with company policies.`,
        `We thank you for your association with Akash Technolabs and wish you every success in your future endeavors.`,
      ];
      break;
    }

    case "RECOMMENDATION_LETTER": {
      title = "LETTER OF RECOMMENDATION";
      headerType = "WHOMSOEVER";
      headerLines = ["TO WHOMSOEVER IT MAY CONCERN"];
      bodyParagraphs = [
        `It is our pleasure to recommend ${displayName}, who completed an internship at Akash Technolabs as a ${pos} from ${start} to ${end}${uniContext}.`,
        `During the internship, the intern worked on assignments and projects related to ${tech}, demonstrating strong technical abilities, dedication, problem-solving skills and professional conduct.`,
        `The intern showed an eagerness to learn, adapt to new technologies and improve their practical understanding through assigned responsibilities.`,
        `Based on their performance and contributions during the internship, we are pleased to recommend them for suitable future academic and professional opportunities.`,
        `We wish them continued growth and success in their career.`,
      ];
      break;
    }
  }

  // Construct full text representation for textarea
  const fullParts: string[] = [];
  if (headerLines.length > 0) {
    fullParts.push(headerLines.join("\n"));
  }
  fullParts.push(...bodyParagraphs);

  return {
    title,
    headerType,
    headerLines,
    bodyParagraphs,
    fullText: fullParts.join("\n\n"),
    signatory: {
      closing: "Sincerely",
      organization: "Akash Technolabs",
      name: sigName,
      role: sigRole,
    },
  };
}

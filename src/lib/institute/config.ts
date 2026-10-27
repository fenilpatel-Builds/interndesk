/**
 * Akash Technolabs — Single Institute Master Configuration
 * Version: 2.0.0 (Single Institute Edition)
 *
 * Defines the central institute parameters, departments, academic programs,
 * email domain governance, registration policies, and contact information.
 */

export interface InstituteDepartment {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  description: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  durationYears: number;
  degreeType: "BACHELORS" | "MASTERS" | "DIPLOMA" | "CERTIFICATION";
}

export interface InstituteConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  legalEntity: string;
  website: string;
  officialEmail: string;
  supportEmail: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  allowedEmailDomains: string[];
  registrationPolicy: "OPEN_VERIFIED" | "VERIFIED_EMAIL_ADMIN_APPROVAL" | "INVITATION_ONLY";
  defaultRole: "STUDENT";
  departments: InstituteDepartment[];
  academicPrograms: AcademicProgram[];
  academicTerms: {
    currentTerm: string;
    academicYear: string;
    startDate: string;
    endDate: string;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    navyColor: string;
    logoUrl: string;
    emblemUrl: string;
  };
}

export const INSTITUTE_CONFIG: InstituteConfig = {
  id: "inst-akash-technolabs",
  name: "Akash Technolabs",
  shortName: "Akash",
  tagline: "Premier IT Training, Software Development & Intern Activity Management",
  legalEntity: "Akash Technolabs Private Limited",
  website: "https://akashtechnolabs.com",
  officialEmail: "info@akashtechnolabs.com",
  supportEmail: "support@akashtechnolabs.com",
  phone: "+91 99786 21654",
  address: {
    line1: "404, Shivalik High Street, Near Keshavbaug Party Plot",
    line2: "Vastrapur",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    postalCode: "380015",
  },
  // Allowed email domains for student/faculty registration
  allowedEmailDomains: [
    "akashtechnolabs.com",
    "student.akashtechnolabs.com",
    "gmail.com",
    "outlook.com",
  ],
  // Default registration policy: verified email with administrator approval gate
  registrationPolicy: "VERIFIED_EMAIL_ADMIN_APPROVAL",
  defaultRole: "STUDENT",
  departments: [
    {
      id: "dept-cse",
      name: "Computer Science & Engineering",
      code: "CSE",
      headOfDepartment: "Prof. Akash Padhiyar",
      description: "Core computing, systems engineering, algorithms, and full-stack software development.",
    },
    {
      id: "dept-it",
      name: "Information Technology",
      code: "IT",
      headOfDepartment: "Prof. Fenil Patel",
      description: "Applied computing, web technologies, enterprise databases, and cloud systems.",
    },
    {
      id: "dept-aiml",
      name: "Artificial Intelligence & Machine Learning",
      code: "AIML",
      headOfDepartment: "Dr. Priya Sharma",
      description: "Deep learning, neural networks, predictive models, NLP, and intelligent agents.",
    },
    {
      id: "dept-ds",
      name: "Data Science & Business Analytics",
      code: "DS",
      headOfDepartment: "Prof. Harshit Mehta",
      description: "Statistical computing, big data pipelines, visualization, and business intelligence.",
    },
    {
      id: "dept-cloud",
      name: "Cloud Computing & DevOps",
      code: "CLOUD",
      headOfDepartment: "Prof. Rajesh Varma",
      description: "Containerization, infrastructure as code, CI/CD pipelines, AWS, and Kubernetes.",
    },
  ],
  academicPrograms: [
    {
      id: "prog-btech-cse",
      name: "B.Tech in Computer Science & Engineering",
      code: "BTECH-CSE",
      departmentId: "dept-cse",
      durationYears: 4,
      degreeType: "BACHELORS",
    },
    {
      id: "prog-btech-it",
      name: "B.Tech in Information Technology",
      code: "BTECH-IT",
      departmentId: "dept-it",
      durationYears: 4,
      degreeType: "BACHELORS",
    },
    {
      id: "prog-btech-aiml",
      name: "B.Tech in Artificial Intelligence & Machine Learning",
      code: "BTECH-AIML",
      departmentId: "dept-aiml",
      durationYears: 4,
      degreeType: "BACHELORS",
    },
    {
      id: "prog-mca",
      name: "Master of Computer Applications (MCA)",
      code: "MCA",
      departmentId: "dept-cse",
      durationYears: 2,
      degreeType: "MASTERS",
    },
    {
      id: "prog-bca",
      name: "Bachelor of Computer Applications (BCA)",
      code: "BCA",
      departmentId: "dept-it",
      durationYears: 3,
      degreeType: "BACHELORS",
    },
    {
      id: "prog-diploma-ce",
      name: "Diploma in Computer Engineering",
      code: "DIPLOMA-CE",
      departmentId: "dept-cse",
      durationYears: 3,
      degreeType: "DIPLOMA",
    },
  ],
  academicTerms: {
    currentTerm: "Academic Term 2026-2027",
    academicYear: "2026-2027",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
  },
  branding: {
    primaryColor: "#d32f2f", // Akash Crimson Red
    accentColor: "#f59e0b",  // Warm Amber
    navyColor: "#0b1329",    // Corporate Midnight Navy
    logoUrl: "/images/akash-technolabs-header-logo.png",
    emblemUrl: "/images/akash-at-watermark-hd.png",
  },
};

/**
 * Validate whether an email domain is permitted under institute policy.
 */
export function isEmailDomainAllowed(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase().trim();
  return INSTITUTE_CONFIG.allowedEmailDomains.some(
    (allowed) => allowed.toLowerCase() === domain
  );
}

/**
 * Look up department by ID or Code.
 */
export function getDepartment(idOrCode: string): InstituteDepartment | undefined {
  return INSTITUTE_CONFIG.departments.find(
    (d) => d.id === idOrCode || d.code.toUpperCase() === idOrCode.toUpperCase()
  );
}

/**
 * Look up academic program by ID or Code.
 */
export function getAcademicProgram(idOrCode: string): AcademicProgram | undefined {
  return INSTITUTE_CONFIG.academicPrograms.find(
    (p) => p.id === idOrCode || p.code.toUpperCase() === idOrCode.toUpperCase()
  );
}

import {
  Organization,
  OrganizationMembership,
  MemberRole,
  Department,
  Team,
  Program,
  BatchCohort,
  Project,
  Task,
  WorkSession,
  WorkBreak,
  DailyReport,
  LearningMaterial,
  Assessment,
  AssessmentAttempt,
  IssuedDocument,
  Announcement,
  AuditLog,
  TaskStatus,
  WorkSessionStatus,
  DailyReportStatus,
  DocumentStatus,
  BreakType,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  MentorshipReview,
} from "../../types/multitenant";
import { generateOrganizationCode } from "./code-generator";
import { hasPermission } from "./permissions";

// Initial Demo Organizations
const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: "org-apex-01",
    name: "Apex Technologies",
    slug: "apex-technologies",
    code: "ORG-7K4P9X",
    type: "CORPORATE",
    status: "APPROVED",
    official_email: "contact@apextech.com",
    contact_number: "+1 (555) 234-5678",
    website: "https://apextech.com",
    country: "United States",
    size: "500-1000",
    industry_or_category: "Cloud Infrastructure & Enterprise SaaS",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
    description: "Global cloud platform and enterprise software engineering headquarters.",
    joining_policy: "REQUEST_APPROVAL",
    allowed_email_domains: ["@apextech.com", "@apex-corp.io"],
    settings: {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      expectedDailyHours: 8,
      gracePeriodMinutes: 15,
      allowedBreakMinutes: 60,
      timeZone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      primaryColor: "#2563EB",
      requireReportReview: true,
      autoApproveAttendance: false,
    },
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "org-westbridge-02",
    name: "Westbridge University",
    slug: "westbridge-university",
    code: "ORG-M8D2QF",
    type: "EDUCATIONAL",
    status: "APPROVED",
    official_email: "admissions@westbridge.edu",
    contact_number: "+1 (555) 987-6543",
    website: "https://westbridge.edu",
    country: "United Kingdom",
    size: "1000+",
    industry_or_category: "Higher Education & Academic Research",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&auto=format&fit=crop&q=80",
    description: "Prestigious academic institution delivering hands-on engineering programs and verified student internships.",
    joining_policy: "CODE_ONLY",
    allowed_email_domains: ["@westbridge.edu", "@alumni.westbridge.edu"],
    settings: {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      expectedDailyHours: 6,
      gracePeriodMinutes: 20,
      allowedBreakMinutes: 45,
      timeZone: "Europe/London",
      dateFormat: "DD/MM/YYYY",
      primaryColor: "#4F46E5",
      requireReportReview: false,
      autoApproveAttendance: true,
    },
    created_at: "2026-01-15T11:00:00Z",
    updated_at: "2026-01-15T11:00:00Z",
  },
  {
    id: "org-futureskills-03",
    name: "Future Skills Institute",
    slug: "future-skills-institute",
    code: "ORG-5T9L3B",
    type: "TRAINING",
    status: "APPROVED",
    official_email: "learn@futureskills.io",
    contact_number: "+91 98765 43210",
    website: "https://futureskills.io",
    country: "India",
    size: "100-250",
    industry_or_category: "AI, Data Engineering & Full Stack Upskilling",
    logo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80",
    description: "Industry-aligned vocational training center and accelerated developer bootcamps.",
    joining_policy: "INVITATION_ONLY",
    allowed_email_domains: ["@futureskills.io"],
    settings: {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      expectedDailyHours: 7,
      gracePeriodMinutes: 10,
      allowedBreakMinutes: 60,
      timeZone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      primaryColor: "#059669",
      requireReportReview: true,
      autoApproveAttendance: false,
    },
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "org-innovate-04",
    name: "Innovate Labs",
    slug: "innovate-labs",
    code: "ORG-9P2K4L",
    type: "INTERNSHIP_PROVIDER",
    status: "VERIFICATION_PENDING",
    official_email: "programs@innovatelabs.org",
    contact_number: "+1 (555) 345-6789",
    website: "https://innovatelabs.org",
    country: "Canada",
    size: "20-50",
    industry_or_category: "Open Source Incubator & Student Placements",
    logo_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80",
    description: "Connecting ambitious interns with production open-source software projects.",
    joining_policy: "REQUEST_APPROVAL",
    allowed_email_domains: [],
    settings: {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      expectedDailyHours: 5,
      gracePeriodMinutes: 30,
      allowedBreakMinutes: 60,
      timeZone: "America/Toronto",
      dateFormat: "YYYY-MM-DD",
      primaryColor: "#D97706",
      requireReportReview: true,
      autoApproveAttendance: false,
    },
    created_at: "2026-03-01T14:00:00Z",
    updated_at: "2026-03-01T14:00:00Z",
  },
];

// Seed Memberships
const INITIAL_MEMBERSHIPS: OrganizationMembership[] = [
  // Apex Tech Members
  {
    id: "mem-apex-admin",
    organization_id: "org-apex-01",
    user_id: "usr-elena",
    employee_id: "EMP-APX-001",
    role: "ORG_ADMIN",
    member_type: "ADMIN",
    status: "ACTIVE",
    job_title: "Head of Engineering Operations",
    designation: "Head of Engineering Operations",
    user_full_name: "Elena Rostova",
    user_email: "admin@apextech.com",
    manager_name: "Board of Directors",
    skills: ["System Architecture", "Leadership", "Cloud Security", "DevOps"],
    employment_status: "FULL_TIME",
    qualifications: "M.S. Computer Science",
    joined_at: "2026-01-11T10:00:00Z",
    created_at: "2026-01-11T10:00:00Z",
    updated_at: "2026-01-11T10:00:00Z",
  },
  {
    id: "mem-apex-mgr",
    organization_id: "org-apex-01",
    user_id: "usr-marcus",
    employee_id: "EMP-APX-014",
    role: "MANAGER_SUPERVISOR",
    member_type: "EMPLOYEE",
    status: "ACTIVE",
    job_title: "Senior Cloud Architect & Lead Mentor",
    designation: "Senior Cloud Architect",
    user_full_name: "Marcus Sterling",
    user_email: "marcus@apextech.com",
    manager_name: "Elena Rostova",
    skills: ["Go", "TypeScript", "PostgreSQL", "Docker", "Kubernetes"],
    employment_status: "FULL_TIME",
    qualifications: "B.Tech Computer Science, 8+ yrs industry",
    joined_at: "2026-01-12T10:00:00Z",
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-01-12T10:00:00Z",
  },
  {
    id: "mem-apex-intern",
    organization_id: "org-apex-01",
    user_id: "usr-sarah",
    employee_id: "INT-APX-042",
    role: "INTERN",
    member_type: "INTERN",
    status: "ACTIVE",
    job_title: "Software Engineering Intern",
    designation: "Backend Engineering Intern",
    user_full_name: "Sarah Chen",
    user_email: "sarah.chen@student.io",
    manager_name: "Marcus Sterling",
    mentor_name: "Marcus Sterling",
    skills: ["TypeScript", "Next.js", "PostgreSQL", "REST APIs"],
    employment_status: "INTERN",
    qualifications: "B.Sc Computer Science (In Progress)",
    custom_profile: {
      internshipTitle: "Backend & Microservices Track",
      mentor: "Marcus Sterling",
      startDate: "2026-01-15",
      endDate: "2026-07-15",
    },
    joined_at: "2026-01-15T09:00:00Z",
    created_at: "2026-01-15T09:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
  },
  // Sarah also belongs to Westbridge University! (Demonstrating Multi-Tenancy)
  {
    id: "mem-westbridge-sarah",
    organization_id: "org-westbridge-02",
    user_id: "usr-sarah",
    employee_id: "STU-WBU-891",
    role: "STUDENT",
    member_type: "STUDENT",
    status: "ACTIVE",
    job_title: "Senior Undergraduate",
    designation: "Senior Undergraduate & Research Assistant",
    user_full_name: "Sarah Chen",
    user_email: "sarah.chen@student.io",
    mentor_name: "Prof. David Kumar",
    skills: ["Algorithms", "Data Structures", "Python"],
    employment_status: "STUDENT",
    qualifications: "Final Year B.Sc Honours",
    custom_profile: {
      studentId: "WBU-2023-CS-891",
      faculty: "School of Computing",
      degree: "B.Sc Computer Science",
      academicYear: "Final Year",
    },
    joined_at: "2026-01-05T09:00:00Z",
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-05T09:00:00Z",
  },
  // Westbridge Admin
  {
    id: "mem-westbridge-admin",
    organization_id: "org-westbridge-02",
    user_id: "usr-david",
    employee_id: "FAC-WBU-002",
    role: "ORG_ADMIN",
    member_type: "FACULTY",
    status: "ACTIVE",
    job_title: "Dean of Internship Placements",
    designation: "Dean of Internship Placements",
    user_full_name: "Prof. David Kumar",
    user_email: "admin@westbridge.edu",
    skills: ["Academic Partnerships", "Curriculum Strategy"],
    employment_status: "FULL_TIME",
    qualifications: "Ph.D. in Computer Engineering",
    joined_at: "2026-01-15T11:00:00Z",
    created_at: "2026-01-15T11:00:00Z",
    updated_at: "2026-01-15T11:00:00Z",
  },
  // Future Skills Trainee
  {
    id: "mem-future-priya",
    organization_id: "org-futureskills-03",
    user_id: "usr-priya",
    employee_id: "TRN-FSI-031",
    role: "STUDENT",
    member_type: "TRAINEE",
    status: "ACTIVE",
    job_title: "AI Engineer Trainee",
    designation: "AI Engineering Fellow",
    user_full_name: "Priya Nair",
    user_email: "priya.nair@email.com",
    skills: ["Python", "PyTorch", "LangChain", "Vector DBs"],
    employment_status: "STUDENT",
    qualifications: "B.E. Information Technology",
    joined_at: "2026-02-05T10:00:00Z",
    created_at: "2026-02-05T10:00:00Z",
    updated_at: "2026-02-05T10:00:00Z",
  },
];

// Seed Departments & Teams
const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "dept-apex-eng",
    organization_id: "org-apex-01",
    name: "Engineering & Platform",
    code: "ENG-01",
    description: "Core distributed systems, cloud computing, and developer tools.",
    created_at: "2026-01-10T09:30:00Z",
  },
  {
    id: "dept-apex-product",
    organization_id: "org-apex-01",
    name: "Product & Design",
    code: "PRD-02",
    description: "User experience research, interface design, and product management.",
    created_at: "2026-01-10T09:30:00Z",
  },
  {
    id: "dept-wbu-cs",
    organization_id: "org-westbridge-02",
    name: "Department of Computer Science",
    code: "CS-101",
    description: "Undergraduate and postgraduate computer science programs.",
    created_at: "2026-01-15T11:30:00Z",
  },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: "team-apex-cloud",
    organization_id: "org-apex-01",
    department_id: "dept-apex-eng",
    name: "Cloud Infra & Security Team",
    description: "Maintains Kubernetes clusters and cloud deployments.",
    created_at: "2026-01-11T10:00:00Z",
  },
  {
    id: "team-apex-api",
    organization_id: "org-apex-01",
    department_id: "dept-apex-eng",
    name: "High-Throughput APIs",
    description: "REST & gRPC microservices pipeline.",
    created_at: "2026-01-11T10:00:00Z",
  },
];

// Seed Programs
const INITIAL_PROGRAMS: Program[] = [
  {
    id: "prog-apex-backend",
    organization_id: "org-apex-01",
    name: "Cloud Backend Engineering Internship",
    description: "Immersion program covering distributed architectures, Postgres optimization, and scalable APIs.",
    type: "Corporate Internship",
    technology: "Go, TypeScript, PostgreSQL, Docker",
    duration: "6 Months",
    start_date: "2026-01-15",
    end_date: "2026-07-15",
    capacity: 25,
    enrolled_count: 14,
    learning_outcomes: [
      "Design fault-tolerant microservice architectures",
      "Deploy containerized workloads to cloud clusters",
      "Implement multi-tenant data isolation and row security",
    ],
    status: "ACTIVE",
    created_at: "2026-01-10T12:00:00Z",
  },
  {
    id: "prog-wbu-capstone",
    organization_id: "org-westbridge-02",
    name: "Capstone Software Practicum 2026",
    description: "Industry-sponsored final semester software engineering project for senior students.",
    type: "Academic Internship",
    technology: "Full Stack Web & Mobile",
    duration: "4 Months",
    start_date: "2026-02-01",
    end_date: "2026-05-30",
    capacity: 60,
    enrolled_count: 52,
    learning_outcomes: [
      "Deliver client-ready software to enterprise sponsors",
      "Practice Agile sprint planning and daily standups",
      "Produce comprehensive technical documentation",
    ],
    status: "ACTIVE",
    created_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "prog-future-ai",
    organization_id: "org-futureskills-03",
    name: "Applied AI & LLM Systems Bootcamp",
    description: "Hands-on engineering program focused on vector databases, RAG architectures, and agentic workflows.",
    type: "Vocational Training",
    technology: "Python, LangChain, PyTorch, Vector DBs",
    duration: "3 Months",
    start_date: "2026-02-15",
    end_date: "2026-05-15",
    capacity: 40,
    enrolled_count: 38,
    learning_outcomes: [
      "Build context-aware Retrieval-Augmented Generation systems",
      "Implement autonomous agent reasoning loops",
      "Fine-tune lightweight embedding models",
    ],
    status: "ACTIVE",
    created_at: "2026-02-01T10:00:00Z",
  },
];

// Seed Tasks
const INITIAL_TASKS: Task[] = [
  {
    id: "task-01",
    organization_id: "org-apex-01",
    title: "Implement Tenant-Scoped Query Filters in Data Layer",
    description: "Ensure all database queries enforce organization_id at the ORM layer to prevent cross-tenant data leakage.",
    priority: "URGENT",
    status: "IN_PROGRESS",
    assignee_id: "mem-apex-intern",
    assignee_name: "Sarah Chen",
    reviewer_id: "mem-apex-mgr",
    due_date: "2026-10-18",
    estimated_effort: "12 Hours",
    acceptance_criteria: "All API routes reject requests without a validated organization scope.",
    comments_count: 3,
    created_at: "2026-10-10T14:00:00Z",
    updated_at: "2026-10-12T10:00:00Z",
  },
  {
    id: "task-02",
    organization_id: "org-apex-01",
    title: "Build Multi-Break Attendance State Machine",
    description: "Add support for Lunch, Personal, and Short breaks with timestamp validation and server duration calculations.",
    priority: "HIGH",
    status: "COMPLETED",
    assignee_id: "mem-apex-intern",
    assignee_name: "Sarah Chen",
    reviewer_id: "mem-apex-mgr",
    due_date: "2026-10-11",
    estimated_effort: "8 Hours",
    acceptance_criteria: "Duration math verified with Vitest unit tests.",
    comments_count: 5,
    created_at: "2026-10-08T09:00:00Z",
    updated_at: "2026-10-11T17:30:00Z",
  },
  {
    id: "task-03",
    organization_id: "org-apex-01",
    title: "Create Organization Switcher Header Component",
    description: "Enable users belonging to multiple organizations to switch workspaces without logging out.",
    priority: "MEDIUM",
    status: "IN_REVIEW",
    assignee_id: "mem-apex-intern",
    assignee_name: "Sarah Chen",
    reviewer_id: "mem-apex-admin",
    due_date: "2026-10-20",
    estimated_effort: "6 Hours",
    acceptance_criteria: "Organization switcher persists active workspace in cookie and updates sidebar context.",
    comments_count: 2,
    created_at: "2026-10-11T11:00:00Z",
    updated_at: "2026-10-12T15:00:00Z",
  },
  {
    id: "task-04",
    organization_id: "org-westbridge-02",
    title: "Submit Midterm Academic Internship Progress Dossier",
    description: "Upload signed supervisor report, timesheet summary, and mid-project code repository link.",
    priority: "HIGH",
    status: "PENDING",
    assignee_id: "mem-westbridge-sarah",
    assignee_name: "Sarah Chen",
    reviewer_id: "mem-westbridge-admin",
    due_date: "2026-10-25",
    estimated_effort: "4 Hours",
    comments_count: 0,
    created_at: "2026-10-05T09:00:00Z",
    updated_at: "2026-10-05T09:00:00Z",
  },
];

// Seed Work Sessions (Attendance)
const INITIAL_WORK_SESSIONS: WorkSession[] = [
  {
    id: "sess-01",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    member_name: "Sarah Chen",
    work_date: "2026-10-12",
    clock_in_at: "2026-10-12T09:15:00Z",
    clock_out_at: undefined,
    status: "WORKING",
    total_seconds: 14400,
    productive_seconds: 12600,
    break_seconds: 1800,
    created_at: "2026-10-12T09:15:00Z",
    updated_at: "2026-10-12T13:15:00Z",
  },
  {
    id: "sess-02",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    member_name: "Sarah Chen",
    work_date: "2026-10-11",
    clock_in_at: "2026-10-11T09:00:00Z",
    clock_out_at: "2026-10-11T17:30:00Z",
    status: "COMPLETED",
    total_seconds: 30600, // 8.5 hours
    productive_seconds: 27000, // 7.5 hours
    break_seconds: 3600, // 1 hour lunch
    created_at: "2026-10-11T09:00:00Z",
    updated_at: "2026-10-11T17:30:00Z",
  },
];

// Seed Daily Reports
const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: "rep-01",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    member_name: "Sarah Chen",
    report_date: "2026-10-11",
    project_or_program: "Cloud Backend Engineering Internship",
    status: "APPROVED",
    activities: "Implemented multi-break state machine in attendance engine and wrote vitest suite.",
    work_completed: "Completed 2 unit test suites with 100% assertion coverage. Pushed commit to feature/work-timer branch.",
    challenges: "Handling edge case when student clocks out while still on an active lunch break.",
    next_steps: "Begin work on Organization Switcher header UI and cookie revalidation.",
    reviewer_id: "mem-apex-mgr",
    reviewer_feedback: "Great work resolving the break state edge case cleanly!",
    entries: [
      { id: "e1", report_id: "rep-01", start_time: "09:00", end_time: "11:00", description: "Design timer state machine" },
      { id: "e2", report_id: "rep-01", start_time: "11:00", end_time: "13:00", description: "Implement duration math and break models" },
      { id: "e3", report_id: "rep-01", start_time: "14:00", end_time: "17:30", description: "Vitest unit tests & edge case testing" },
    ],
    submitted_at: "2026-10-11T17:35:00Z",
    reviewed_at: "2026-10-11T18:15:00Z",
    created_at: "2026-10-11T17:35:00Z",
  },
  {
    id: "rep-02",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    member_name: "Sarah Chen",
    report_date: "2026-10-12",
    project_or_program: "Cloud Backend Engineering Internship",
    status: "UNDER_REVIEW",
    activities: "Constructed tenant-scoped query filters and verified schema constraints.",
    work_completed: "Configured PostgreSQL DDL migrations with organization_id foreign keys and RLS policies.",
    challenges: "Coordinating backward compatibility for users in multiple tenants.",
    next_steps: "Complete documentation for multi-tenant onboarding flow.",
    submitted_at: "2026-10-12T17:00:00Z",
    created_at: "2026-10-12T17:00:00Z",
  },
];

// Seed Learning Materials
const INITIAL_LEARNING_MATERIALS: LearningMaterial[] = [
  {
    id: "mat-01",
    organization_id: "org-apex-01",
    program_id: "prog-apex-backend",
    title: "Enterprise Multi-Tenant System Architecture Guide",
    description: "Deep dive into row-level security, tenant resolution patterns, and database isolation models.",
    content_type: "PDF",
    category: "Architecture & Security",
    url_or_path: "https://arxiv.org/pdf/2301.00001",
    tags: ["PostgreSQL", "RLS", "Multi-Tenancy", "Security"],
    estimated_duration: "45 Mins",
    completed: true,
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "mat-02",
    organization_id: "org-apex-01",
    program_id: "prog-apex-backend",
    title: "Asynchronous Workflows & Resilient Message Queues",
    description: "Best practices for background workers, idempotent jobs, and webhook delivery guarantees.",
    content_type: "DOCUMENT",
    category: "Cloud Engineering",
    url_or_path: "/docs/async-workflows.md",
    tags: ["Queues", "Idempotency", "Redis", "Kafka"],
    estimated_duration: "30 Mins",
    completed: false,
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "mat-03",
    organization_id: "org-westbridge-02",
    program_id: "prog-wbu-capstone",
    title: "Academic Capstone Project Standards & Ethics Handout",
    description: "Guidelines on source attribution, software licensing, and industry sponsor disclosure.",
    content_type: "PDF",
    category: "Academic Policy",
    url_or_path: "/docs/academic-handbook.pdf",
    tags: ["Ethics", "Licensing", "Capstone"],
    estimated_duration: "20 Mins",
    completed: true,
    created_at: "2026-01-16T11:00:00Z",
  },
];

// Seed Assessments
const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: "asm-01",
    organization_id: "org-apex-01",
    program_id: "prog-apex-backend",
    title: "Multi-Tenant Cloud Architecture & Security Assessment",
    description: "Technical evaluation of tenant isolation rules, data leak prevention, and role-based permissions.",
    duration_minutes: 20,
    total_marks: 100,
    passing_threshold: 70,
    attempt_limit: 3,
    status: "PUBLISHED",
    questions: [
      {
        id: "q1",
        question: "Why must multi-tenant isolation be enforced at the server and database layer rather than relying on frontend UI filtering?",
        type: "SINGLE_CHOICE",
        options: [
          "Frontend UI code is executed on the client and can be inspected or bypassed by modifying HTTP network requests.",
          "Browsers do not support CSS styling for hidden tenant records.",
          "Frontend filtering consumes more CPU than database indexes.",
          "It is only recommended for mobile applications, not web apps."
        ],
        correct_answer: "Frontend UI code is executed on the client and can be inspected or bypassed by modifying HTTP network requests.",
        explanation: "Client-side filtering provides zero security boundary. Any user with DevTools can intercept, forge, or modify API requests to retrieve unauthorized tenant records.",
        marks: 25,
      },
      {
        id: "q2",
        question: "What is the primary security requirement for an Organization Code (e.g. ORG-7K4P9X)?",
        type: "SINGLE_CHOICE",
        options: [
          "It acts as a private encryption password for direct DB access.",
          "It is a workspace discovery identifier; knowing the code must NEVER grant automatic access without authentication and policy checks.",
          "It must change every 5 minutes like a TOTP token.",
          "It is stored in plaintext in the browser URL hash."
        ],
        correct_answer: "It is a workspace discovery identifier; knowing the code must NEVER grant automatic access without authentication and policy checks.",
        explanation: "The organization code allows members to discover and request to join the organization, but workspace access requires authenticated verification and administrator approval according to organizational policy.",
        marks: 25,
      },
      {
        id: "q3",
        question: "When a user belongs to multiple organizations, what must occur when switching workspaces?",
        type: "SINGLE_CHOICE",
        options: [
          "Merge both organizations' tasks and reports into a single screen.",
          "Revalidate user permissions, reset tenant context, and strictly reload only the authorized data of the targeted workspace.",
          "Prompt the user to pay a workspace switching fee.",
          "Log out the user and delete their browser cookies."
        ],
        correct_answer: "Revalidate user permissions, reset tenant context, and strictly reload only the authorized data of the targeted workspace.",
        explanation: "Workspace switching must strictly preserve tenant isolation and refresh role permissions to ensure data never leaks across corporate boundaries.",
        marks: 25,
      },
      {
        id: "q4",
        question: "Under InternDesk non-negotiable enterprise product rules, what is the policy regarding payment systems?",
        type: "SINGLE_CHOICE",
        options: [
          "Every course must cost $49.",
          "Organizations must set up Stripe checkout for student enrollment.",
          "No registration fees, no course payment systems, and zero payment gateways anywhere in the platform.",
          "Payments are mandatory for certificate generation only."
        ],
        correct_answer: "No registration fees, no course payment systems, and zero payment gateways anywhere in the platform.",
        explanation: "InternDesk is 100% free for registration and courses, with strictly no payment gateways, checkout pages, or financial tables.",
        marks: 25,
      },
    ],
    created_at: "2026-02-01T10:00:00Z",
  },
];

// Seed Issued Documents & Certificates
const INITIAL_DOCUMENTS: IssuedDocument[] = [
  {
    id: "doc-01",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    document_number: "IND-APX-2026-0042",
    document_type: "OFFER_LETTER",
    title: "Official Internship Offer Letter",
    recipient_name: "Sarah Chen",
    recipient_role: "Software Engineering Intern",
    issued_date: "2026-01-12",
    status: "ISSUED",
    verification_code: "VRF-APX-98214-SEC",
    template_data: {
      organization_name: "Apex Technologies",
      organization_type: "CORPORATE",
      signatory_name: "Elena Rostova",
      signatory_title: "Head of Engineering Operations",
      program_or_track: "Cloud Backend Engineering Track",
      validity: "Active / Verified",
    },
    created_at: "2026-01-12T14:00:00Z",
  },
  {
    id: "doc-02",
    organization_id: "org-westbridge-02",
    member_id: "mem-westbridge-sarah",
    document_number: "IND-WBU-2026-0108",
    document_type: "COMPLETION_CERTIFICATE",
    title: "Dean's Academic Excellence Certificate",
    recipient_name: "Sarah Chen",
    recipient_role: "Senior Undergraduate",
    issued_date: "2026-03-01",
    status: "ISSUED",
    verification_code: "VRF-WBU-33419-EDU",
    template_data: {
      organization_name: "Westbridge University",
      organization_type: "EDUCATIONAL",
      signatory_name: "Prof. David Kumar",
      signatory_title: "Dean of Internship Placements",
      program_or_track: "Capstone Software Practicum",
      grade_or_evaluation: "Grade: A+ (Honors)",
      validity: "Permanent Academic Credential",
    },
    created_at: "2026-03-01T10:00:00Z",
  },
];

// Seed Announcements
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "anc-01",
    organization_id: "org-apex-01",
    title: "Q4 Engineering All-Hands & Technical Showcase",
    content: "All engineering teams and interns will gather virtually this Thursday at 2 PM EST for project presentations and cloud architecture updates.",
    target_scope: "ORG_WIDE",
    author_name: "Elena Rostova (Org Admin)",
    priority: "IMPORTANT",
    created_at: "2026-10-10T11:00:00Z",
  },
  {
    id: "anc-02",
    organization_id: "org-apex-01",
    title: "Reminder: Daily Report Submission Protocol",
    content: "Please ensure your daily reports include specific hourly breakdown and challenges encountered to enable timely mentor feedback.",
    target_scope: "PROGRAM",
    target_name: "Cloud Backend Engineering Internship",
    author_name: "Marcus Sterling (Lead Mentor)",
    priority: "NORMAL",
    created_at: "2026-10-11T09:00:00Z",
  },
  {
    id: "anc-03",
    organization_id: "org-westbridge-02",
    title: "University Fall Career & Internship Fair Announced",
    content: "Over 40 technology partners and research institutes will be recruiting on campus next month. Update your verified InternDesk portfolio.",
    target_scope: "ORG_WIDE",
    author_name: "Prof. David Kumar",
    priority: "IMPORTANT",
    created_at: "2026-10-08T14:00:00Z",
  },
];

// Seed Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-01",
    organization_id: "org-apex-01",
    actor_email: "admin@apextech.com",
    actor_role: "ORG_ADMIN",
    action: "TASK_ASSIGNED",
    resource: "Task #task-01",
    ip_address: "192.168.1.42",
    details: { assignee: "Sarah Chen", priority: "URGENT" },
    created_at: "2026-10-10T14:00:00Z",
  },
  {
    id: "log-02",
    organization_id: "org-apex-01",
    actor_email: "sarah.chen@student.io",
    actor_role: "INTERN",
    action: "ATTENDANCE_CLOCK_IN",
    resource: "Session #sess-01",
    ip_address: "192.168.1.98",
    details: { timestamp: "2026-10-12T09:15:00Z" },
    created_at: "2026-10-12T09:15:00Z",
  },
  {
    id: "log-03",
    actor_email: "superadmin@interndesk.com",
    actor_role: "SUPER_ADMIN",
    action: "ORGANIZATION_VERIFIED",
    resource: "Westbridge University",
    ip_address: "10.0.0.1",
    details: { method: "MANUAL_SUPERADMIN", status: "APPROVED" },
    created_at: "2026-01-16T10:00:00Z",
  },
];

// Seed Leave Requests
const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "leave-01",
    organization_id: "org-apex-01",
    member_id: "mem-apex-intern",
    member_name: "Sarah Chen",
    leave_type: "STUDY",
    start_date: "2026-10-25",
    end_date: "2026-10-26",
    days_count: 2,
    reason: "University midterm examinations for Capstone Software Practicum.",
    status: "APPROVED",
    reviewer_id: "mem-apex-mgr",
    reviewer_name: "Marcus Sterling",
    reviewer_notes: "Approved. Please ensure sprint tasks are up to date before exam.",
    reviewed_at: "2026-10-12T14:00:00Z",
    created_at: "2026-10-11T09:00:00Z",
  },
  {
    id: "leave-02",
    organization_id: "org-apex-01",
    member_id: "mem-apex-mgr",
    member_name: "Marcus Sterling",
    leave_type: "ANNUAL",
    start_date: "2026-11-05",
    end_date: "2026-11-07",
    days_count: 3,
    reason: "Annual family holiday leave.",
    status: "PENDING",
    created_at: "2026-10-12T11:00:00Z",
  },
  {
    id: "leave-03",
    organization_id: "org-westbridge-02",
    member_id: "mem-westbridge-sarah",
    member_name: "Sarah Chen",
    leave_type: "EMERGENCY",
    start_date: "2026-09-15",
    end_date: "2026-09-15",
    days_count: 1,
    reason: "Family emergency relocation.",
    status: "APPROVED",
    reviewer_id: "mem-westbridge-admin",
    reviewer_name: "Prof. David Kumar",
    reviewer_notes: "Excused emergency absence.",
    reviewed_at: "2026-09-15T10:00:00Z",
    created_at: "2026-09-14T18:00:00Z",
  },
];

// Seed Mentorship Reviews
const INITIAL_MENTORSHIP_REVIEWS: MentorshipReview[] = [
  {
    id: "mrev-01",
    organization_id: "org-apex-01",
    intern_id: "mem-apex-intern",
    intern_name: "Sarah Chen",
    mentor_id: "mem-apex-mgr",
    mentor_name: "Marcus Sterling",
    week_number: 4,
    technical_score: 9,
    communication_score: 9,
    initiative_score: 10,
    feedback: "Exceptional mastery of multi-tenant query isolation and server-side authentication boundaries. Sarah demonstrated high engineering independence.",
    milestone_status: "EXCELLING",
    created_at: "2026-10-10T16:00:00Z",
  },
  {
    id: "mrev-02",
    organization_id: "org-apex-01",
    intern_id: "mem-apex-intern",
    intern_name: "Sarah Chen",
    mentor_id: "mem-apex-mgr",
    mentor_name: "Marcus Sterling",
    week_number: 3,
    technical_score: 8,
    communication_score: 8,
    initiative_score: 9,
    feedback: "Solid delivery of attendance timer state machine and break calculations. Well-documented pull request.",
    milestone_status: "ON_TRACK",
    created_at: "2026-10-03T17:00:00Z",
  },
];

// Runtime Multi-Tenant Memory Store
class MultiTenantStore {
  private organizations: Organization[] = [...INITIAL_ORGANIZATIONS];
  private memberships: OrganizationMembership[] = [...INITIAL_MEMBERSHIPS];
  private departments: Department[] = [...INITIAL_DEPARTMENTS];
  private teams: Team[] = [...INITIAL_TEAMS];
  private programs: Program[] = [...INITIAL_PROGRAMS];
  private tasks: Task[] = [...INITIAL_TASKS];
  private workSessions: WorkSession[] = [...INITIAL_WORK_SESSIONS];
  private dailyReports: DailyReport[] = [...INITIAL_DAILY_REPORTS];
  private learningMaterials: LearningMaterial[] = [...INITIAL_LEARNING_MATERIALS];
  private assessments: Assessment[] = [...INITIAL_ASSESSMENTS];
  private assessmentAttempts: AssessmentAttempt[] = [];
  private documents: IssuedDocument[] = [...INITIAL_DOCUMENTS];
  private announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];
  private mentorshipReviews: MentorshipReview[] = [...INITIAL_MENTORSHIP_REVIEWS];

  // ================= ORGANIZATIONS =================
  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  public getOrganizationBySlug(slug: string): Organization | undefined {
    return this.organizations.find((o) => o.slug === slug);
  }

  public getOrganizationByCode(code: string): Organization | undefined {
    const cleaned = code.trim().toUpperCase();
    return this.organizations.find((o) => o.code.toUpperCase() === cleaned);
  }

  public createOrganization(data: Omit<Organization, "id" | "code" | "status" | "created_at" | "updated_at">): Organization {
    const newOrg: Organization = {
      ...data,
      id: `org-${Date.now()}`,
      code: generateOrganizationCode(),
      status: "VERIFICATION_PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.organizations.push(newOrg);

    // Audit log
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: newOrg.id,
      actor_email: data.official_email,
      actor_role: "ORG_OWNER",
      action: "ORGANIZATION_CREATED",
      resource: newOrg.name,
      ip_address: "127.0.0.1",
      details: { code: newOrg.code, type: newOrg.type },
      created_at: new Date().toISOString(),
    });

    return newOrg;
  }

  public updateOrganization(id: string, data: Partial<Organization>): Organization | undefined {
    const index = this.organizations.findIndex((o) => o.id === id);
    if (index === -1) return undefined;

    this.organizations[index] = {
      ...this.organizations[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.organizations[index];
  }

  public verifyOrganization(id: string, status: "APPROVED" | "REJECTED" | "SUSPENDED", notes?: string): Organization | undefined {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return undefined;

    org.status = status;
    org.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: org.id,
      actor_email: "superadmin@interndesk.com",
      actor_role: "SUPER_ADMIN",
      action: `ORGANIZATION_${status}`,
      resource: org.name,
      ip_address: "127.0.0.1",
      details: { notes },
      created_at: new Date().toISOString(),
    });

    return org;
  }

  public rotateOrganizationCode(id: string): Organization | undefined {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return undefined;

    const oldCode = org.code;
    org.code = generateOrganizationCode();
    org.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: org.id,
      actor_email: "superadmin@interndesk.com",
      actor_role: "SUPER_ADMIN",
      action: "ORGANIZATION_CODE_ROTATED",
      resource: org.name,
      ip_address: "127.0.0.1",
      details: { oldCode, newCode: org.code },
      created_at: new Date().toISOString(),
    });

    return org;
  }

  // ================= MEMBERSHIPS =================
  public getMemberships(organizationId: string): OrganizationMembership[] {
    return this.memberships.filter((m) => m.organization_id === organizationId);
  }

  public getUserMemberships(userEmail: string): OrganizationMembership[] {
    const userMems = this.memberships.filter((m) => m.user_email?.toLowerCase() === userEmail.toLowerCase());
    return userMems.map((m) => {
      const org = this.getOrganizationById(m.organization_id);
      return {
        ...m,
        organization_name: org?.name,
        organization_code: org?.code,
        organization_type: org?.type,
      };
    });
  }

  public addMembership(data: Omit<OrganizationMembership, "id" | "created_at" | "updated_at">): OrganizationMembership {
    const newMem: OrganizationMembership = {
      ...data,
      id: `mem-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.memberships.push(newMem);
    return newMem;
  }

  public updateMembershipStatus(id: string, status: OrganizationMembership["status"]): OrganizationMembership | undefined {
    const mem = this.memberships.find((m) => m.id === id);
    if (!mem) return undefined;
    mem.status = status;
    mem.updated_at = new Date().toISOString();
    return mem;
  }

  // ================= DEPARTMENTS & TEAMS =================
  public getDepartments(organizationId: string): Department[] {
    return this.departments.filter((d) => d.organization_id === organizationId);
  }

  public getTeams(organizationId: string): Team[] {
    return this.teams.filter((t) => t.organization_id === organizationId);
  }

  // ================= PROGRAMS =================
  public getPrograms(organizationId: string): Program[] {
    return this.programs.filter((p) => p.organization_id === organizationId);
  }

  public createProgram(data: Omit<Program, "id" | "created_at">): Program {
    const newProg: Program = {
      ...data,
      id: `prog-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.programs.push(newProg);
    return newProg;
  }

  // ================= TASKS =================
  public getTasks(organizationId: string, memberId?: string): Task[] {
    let list = this.tasks.filter((t) => t.organization_id === organizationId);
    if (memberId) {
      list = list.filter((t) => t.assignee_id === memberId);
    }
    return list;
  }

  public createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  public updateTaskStatus(organizationId: string, taskId: string, status: TaskStatus): Task | undefined {
    const task = this.tasks.find((t) => t.id === taskId && t.organization_id === organizationId);
    if (!task) return undefined;
    task.status = status;
    task.updated_at = new Date().toISOString();
    return task;
  }

  // ================= ATTENDANCE / WORK SESSIONS =================
  public getWorkSessions(organizationId: string, memberId?: string): WorkSession[] {
    let list = this.workSessions.filter((s) => s.organization_id === organizationId);
    if (memberId) {
      list = list.filter((s) => s.member_id === memberId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getActiveWorkSession(organizationId: string, memberId: string): WorkSession | undefined {
    return this.workSessions.find(
      (s) => s.organization_id === organizationId && s.member_id === memberId && (s.status === "WORKING" || s.status === "ON_BREAK")
    );
  }

  public clockIn(organizationId: string, memberId: string, memberName: string): WorkSession {
    // Check if session already active
    const active = this.getActiveWorkSession(organizationId, memberId);
    if (active) return active;

    const newSession: WorkSession = {
      id: `sess-${Date.now()}`,
      organization_id: organizationId,
      member_id: memberId,
      member_name: memberName,
      work_date: new Date().toISOString().split("T")[0],
      clock_in_at: new Date().toISOString(),
      status: "WORKING",
      total_seconds: 0,
      productive_seconds: 0,
      break_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.workSessions.unshift(newSession);
    return newSession;
  }

  public startBreak(organizationId: string, sessionId: string, breakType: BreakType): WorkSession | undefined {
    const session = this.workSessions.find((s) => s.id === sessionId && s.organization_id === organizationId);
    if (!session || session.status !== "WORKING") return undefined;

    session.status = "ON_BREAK";
    session.current_break_type = breakType;
    session.updated_at = new Date().toISOString();
    return session;
  }

  public resumeBreak(organizationId: string, sessionId: string): WorkSession | undefined {
    const session = this.workSessions.find((s) => s.id === sessionId && s.organization_id === organizationId);
    if (!session || session.status !== "ON_BREAK") return undefined;

    session.status = "WORKING";
    session.current_break_type = undefined;
    session.updated_at = new Date().toISOString();
    return session;
  }

  public clockOut(organizationId: string, sessionId: string): WorkSession | undefined {
    const session = this.workSessions.find((s) => s.id === sessionId && s.organization_id === organizationId);
    if (!session || session.status === "COMPLETED") return undefined;

    const clockOutTime = new Date();
    const clockInTime = new Date(session.clock_in_at);
    const elapsedSeconds = Math.max(0, Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000));

    session.clock_out_at = clockOutTime.toISOString();
    session.status = "COMPLETED";
    session.total_seconds = elapsedSeconds;
    session.break_seconds = session.break_seconds || 1800; // default estimated break if not explicitly recorded
    session.productive_seconds = Math.max(0, session.total_seconds - session.break_seconds);
    session.updated_at = clockOutTime.toISOString();
    return session;
  }

  public correctWorkSession(organizationId: string, sessionId: string, productiveSeconds: number, reason: string): WorkSession | undefined {
    const session = this.workSessions.find((s) => s.id === sessionId && s.organization_id === organizationId);
    if (!session) return undefined;

    session.productive_seconds = productiveSeconds;
    session.total_seconds = productiveSeconds + (session.break_seconds || 0);
    session.correction_reason = reason;
    session.updated_at = new Date().toISOString();
    return session;
  }

  // ================= DAILY REPORTS =================
  public getDailyReports(organizationId: string, memberId?: string): DailyReport[] {
    let list = this.dailyReports.filter((r) => r.organization_id === organizationId);
    if (memberId) {
      list = list.filter((r) => r.member_id === memberId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public submitDailyReport(data: Omit<DailyReport, "id" | "status" | "created_at">): DailyReport {
    const newReport: DailyReport = {
      ...data,
      id: `rep-${Date.now()}`,
      status: "UNDER_REVIEW",
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.dailyReports.unshift(newReport);
    return newReport;
  }

  public reviewDailyReport(organizationId: string, reportId: string, status: "APPROVED" | "NEEDS_REVISION", feedback: string, reviewerId: string): DailyReport | undefined {
    const report = this.dailyReports.find((r) => r.id === reportId && r.organization_id === organizationId);
    if (!report) return undefined;

    report.status = status;
    report.reviewer_feedback = feedback;
    report.reviewer_id = reviewerId;
    report.reviewed_at = new Date().toISOString();
    return report;
  }

  // ================= LEARNING MATERIALS =================
  public getLearningMaterials(organizationId: string): LearningMaterial[] {
    return this.learningMaterials.filter((m) => m.organization_id === organizationId);
  }

  public createLearningMaterial(data: Omit<LearningMaterial, "id" | "created_at">): LearningMaterial {
    const newMat: LearningMaterial = {
      ...data,
      id: `mat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.learningMaterials.unshift(newMat);
    return newMat;
  }

  // ================= ASSESSMENTS =================
  public getAssessments(organizationId: string): Assessment[] {
    return this.assessments.filter((a) => a.organization_id === organizationId);
  }

  public getAssessmentById(organizationId: string, id: string): Assessment | undefined {
    return this.assessments.find((a) => a.id === id && a.organization_id === organizationId);
  }

  public submitAssessmentAttempt(
    organizationId: string,
    assessmentId: string,
    memberId: string,
    answers: Record<string, string | string[]>
  ): AssessmentAttempt {
    const assessment = this.getAssessmentById(organizationId, assessmentId);
    if (!assessment) throw new Error("Assessment not found in organization.");

    let earnedMarks = 0;
    assessment.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (typeof studentAns === "string" && typeof q.correct_answer === "string") {
        if (studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
          earnedMarks += q.marks;
        }
      }
    });

    const percentage = Math.round((earnedMarks / assessment.total_marks) * 100);
    const passed = percentage >= assessment.passing_threshold;

    const attempt: AssessmentAttempt = {
      id: `att-${Date.now()}`,
      organization_id: organizationId,
      assessment_id: assessmentId,
      member_id: memberId,
      score: earnedMarks,
      total_marks: assessment.total_marks,
      percentage,
      passed,
      started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      answers,
    };
    this.assessmentAttempts.unshift(attempt);
    return attempt;
  }

  public getAssessmentAttempts(organizationId: string, memberId?: string): AssessmentAttempt[] {
    let list = this.assessmentAttempts.filter((a) => a.organization_id === organizationId);
    if (memberId) {
      list = list.filter((a) => a.member_id === memberId);
    }
    return list;
  }

  // ================= DOCUMENTS & CERTIFICATES =================
  public getIssuedDocuments(organizationId: string, memberId?: string): IssuedDocument[] {
    let list = this.documents.filter((d) => d.organization_id === organizationId);
    if (memberId) {
      list = list.filter((d) => d.member_id === memberId);
    }
    return list;
  }

  public issueDocument(data: Omit<IssuedDocument, "id" | "created_at">): IssuedDocument {
    const newDoc: IssuedDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    return newDoc;
  }

  public verifyDocumentByNumber(documentNumber: string): IssuedDocument | undefined {
    const cleaned = documentNumber.trim().toUpperCase();
    return this.documents.find((d) => d.document_number.toUpperCase() === cleaned && d.status === "ISSUED");
  }

  // ================= ANNOUNCEMENTS =================
  public getAnnouncements(organizationId: string): Announcement[] {
    return this.announcements.filter((a) => a.organization_id === organizationId);
  }

  public createAnnouncement(data: Omit<Announcement, "id" | "created_at">): Announcement {
    const newAnc: Announcement = {
      ...data,
      id: `anc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.announcements.unshift(newAnc);
    return newAnc;
  }

  // ================= AUDIT LOGS =================
  public getAuditLogs(organizationId?: string): AuditLog[] {
    if (organizationId) {
      return this.auditLogs.filter((l) => l.organization_id === organizationId);
    }
    return [...this.auditLogs];
  }

  // ================= LEAVE MANAGEMENT =================
  public getLeaveRequests(organizationId: string, memberId?: string): LeaveRequest[] {
    let list = this.leaveRequests.filter((l) => l.organization_id === organizationId);
    if (memberId) {
      list = list.filter((l) => l.member_id === memberId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public submitLeaveRequest(data: Omit<LeaveRequest, "id" | "status" | "created_at">): LeaveRequest {
    const newLeave: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    this.leaveRequests.unshift(newLeave);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: data.organization_id,
      actor_email: data.member_name,
      actor_role: "EMPLOYEE",
      action: "LEAVE_REQUESTED",
      resource: `Leave (${data.leave_type})`,
      ip_address: "127.0.0.1",
      details: { days: data.days_count, start: data.start_date, end: data.end_date },
      created_at: new Date().toISOString(),
    });

    return newLeave;
  }

  public reviewLeaveRequest(
    organizationId: string,
    leaveId: string,
    status: "APPROVED" | "REJECTED",
    notes?: string,
    reviewerName: string = "Workspace Administrator"
  ): LeaveRequest | undefined {
    const leave = this.leaveRequests.find((l) => l.id === leaveId && l.organization_id === organizationId);
    if (!leave) return undefined;

    leave.status = status;
    leave.reviewer_notes = notes;
    leave.reviewer_name = reviewerName;
    leave.reviewed_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: organizationId,
      actor_email: reviewerName,
      actor_role: "ORG_ADMIN",
      action: `LEAVE_${status}`,
      resource: `Leave #${leave.id}`,
      ip_address: "127.0.0.1",
      details: { member: leave.member_name, notes },
      created_at: new Date().toISOString(),
    });

    return leave;
  }

  // ================= MENTORSHIP & PROGRESS REVIEWS =================
  public getMentorshipReviews(organizationId: string, internId?: string): MentorshipReview[] {
    let list = this.mentorshipReviews.filter((m) => m.organization_id === organizationId);
    if (internId) {
      list = list.filter((m) => m.intern_id === internId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public submitMentorshipReview(data: Omit<MentorshipReview, "id" | "created_at">): MentorshipReview {
    const review: MentorshipReview = {
      ...data,
      id: `mrev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.mentorshipReviews.unshift(review);
    return review;
  }

  // ================= TASK COLLABORATION & COMMENTS =================
  public addTaskComment(
    organizationId: string,
    taskId: string,
    authorName: string,
    text: string
  ): Task | undefined {
    const task = this.tasks.find((t) => t.id === taskId && t.organization_id === organizationId);
    if (!task) return undefined;

    if (!task.comments) task.comments = [];
    task.comments.push({
      id: `cmt-${Date.now()}`,
      author_name: authorName,
      text,
      created_at: new Date().toISOString(),
    });
    task.comments_count = task.comments.length;
    task.updated_at = new Date().toISOString();
    return task;
  }

  // ================= MEMBER ACTIVATION / DEACTIVATION =================
  public toggleMembershipStatus(id: string): OrganizationMembership | undefined {
    const mem = this.memberships.find((m) => m.id === id);
    if (!mem) return undefined;

    mem.status = mem.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    mem.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      organization_id: mem.organization_id,
      actor_email: "admin@apextech.com",
      actor_role: "ORG_ADMIN",
      action: `MEMBER_STATUS_${mem.status}`,
      resource: mem.user_full_name || mem.id,
      ip_address: "127.0.0.1",
      details: { memberId: mem.id, newStatus: mem.status },
      created_at: new Date().toISOString(),
    });

    return mem;
  }

  // ================= SUPER ADMIN METRICS =================
  public getSuperAdminMetrics() {
    const totalOrgs = this.organizations.length;
    const verifiedOrgs = this.organizations.filter((o) => o.status === "APPROVED").length;
    const pendingVerifications = this.organizations.filter((o) => o.status === "VERIFICATION_PENDING").length;
    const suspendedOrgs = this.organizations.filter((o) => o.status === "SUSPENDED").length;
    const totalMembers = this.memberships.length;
    const activeTasks = this.tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length;

    return {
      totalOrgs,
      verifiedOrgs,
      pendingVerifications,
      suspendedOrgs,
      totalMembers,
      activeTasks,
      platformHealth: "100% Operational",
    };
  }

  // ================= SECURITY & ACCESS CONTROL =================
  public canUserAccessOrganization(userEmail: string, organizationId: string): boolean {
    const mem = this.memberships.find(
      (m) => m.organization_id === organizationId && m.user_email?.toLowerCase() === userEmail.toLowerCase()
    );
    if (!mem) return false;
    if (mem.status === "SUSPENDED" || mem.status === "REJECTED") return false;
    const org = this.getOrganizationById(organizationId);
    if (!org || org.status === "SUSPENDED") return false;
    return true;
  }

  public validateInvitationToken(token: string): {
    valid: boolean;
    organization?: Organization;
    role?: MemberRole;
    error?: string;
  } {
    const sampleInvites: Record<string, { orgId: string; role: MemberRole; expiresAt: string }> = {
      "INV-APX-VALID-2026": { orgId: "org-apex-01", role: "INTERN", expiresAt: "2026-12-31T23:59:59Z" },
      "INV-WB-EXPIRED-2026": { orgId: "org-westbridge-02", role: "STUDENT", expiresAt: "2026-01-01T00:00:00Z" },
    };

    const inv = sampleInvites[token];
    if (!inv) {
      return { valid: false, error: "Invalid invitation token." };
    }

    if (new Date(inv.expiresAt).getTime() < Date.now()) {
      return { valid: false, error: "Invitation token has expired." };
    }

    const org = this.getOrganizationById(inv.orgId);
    if (!org || org.status === "SUSPENDED") {
      return { valid: false, error: "Organization is not active." };
    }

    return { valid: true, organization: org, role: inv.role };
  }

  public isPrivateDocumentAccessible(
    docId: string,
    requestorEmail: string,
    requestorRole: MemberRole,
    organizationId: string
  ): boolean {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) return false;
    // Cross-tenant boundary check: document MUST belong to the requested organization
    if (doc.organization_id !== organizationId) return false;

    // Public certificates can be viewed if validly issued
    if (doc.document_type === "COMPLETION_CERTIFICATE" && doc.status === "ISSUED") return true;

    // Organization administrator can access documents within their own tenant
    if (hasPermission(requestorRole, "documents.issue")) return true;

    // Individual member can only access their own document
    const mem = this.memberships.find((m) => m.id === doc.member_id);
    return mem?.user_email?.toLowerCase() === requestorEmail.toLowerCase();
  }

  public canAssignRole(actorRole: MemberRole, targetRole: MemberRole): boolean {
    // Platform Super Admin privileges can NEVER be granted by organization owners or admins
    if (targetRole === "SUPER_ADMIN") {
      return actorRole === "SUPER_ADMIN";
    }
    return hasPermission(actorRole, "members.manage");
  }
}

// Singleton global store instance
export const multiTenantStore = new MultiTenantStore();

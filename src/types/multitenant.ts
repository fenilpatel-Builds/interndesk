export type OrganizationType =
  | "CORPORATE"
  | "EDUCATIONAL"
  | "TRAINING"
  | "INTERNSHIP_PROVIDER"
  | "HYBRID";

export type OrganizationStatus =
  | "DRAFT"
  | "EMAIL_VERIFICATION_PENDING"
  | "VERIFICATION_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED";

export type JoiningPolicy =
  | "CODE_ONLY"
  | "INVITATION_ONLY"
  | "REQUEST_APPROVAL"
  | "OPEN_VERIFIED";

export type MemberRole =
  | "SUPER_ADMIN"
  | "ORG_OWNER"
  | "ORG_ADMIN"
  | "HR_COORDINATOR"
  | "MANAGER_SUPERVISOR"
  | "TRAINER_MENTOR"
  | "EMPLOYEE"
  | "INTERN"
  | "STUDENT"
  | "AUDITOR";

export type MemberType =
  | "STUDENT"
  | "INTERN"
  | "EMPLOYEE"
  | "TRAINEE"
  | "FACULTY"
  | "TRAINER"
  | "MENTOR"
  | "ADMIN";

export type MembershipStatus =
  | "ACTIVE"
  | "INVITATION_PENDING"
  | "JOIN_REQUEST_PENDING"
  | "PENDING_APPROVAL"
  | "SUSPENDED"
  | "REJECTED"
  | "REMOVED"
  | "LEFT";

export type WorkSessionStatus =
  | "NOT_STARTED"
  | "WORKING"
  | "ON_BREAK"
  | "COMPLETED";

export type BreakType = "LUNCH" | "PERSONAL" | "SHORT_BREAK" | "TEA" | "OTHER";

export type TaskStatus =
  | "BACKLOG"
  | "PENDING"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED"
  | "OVERDUE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type DailyReportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "NEEDS_REVISION";

export type DocumentType =
  | "OFFER_LETTER"
  | "INTERNSHIP_LETTER"
  | "EXPERIENCE_LETTER"
  | "COMPLETION_CERTIFICATE"
  | "TRAINING_CERTIFICATE"
  | "PARTICIPATION_CERTIFICATE"
  | "PERFORMANCE_TRANSCRIPT";

export type DocumentStatus =
  | "NOT_ELIGIBLE"
  | "ELIGIBLE"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ISSUED"
  | "ACCEPTED"
  | "REVOKED";

export type TemplateTheme = "CLASSIC_IVY" | "MODERN_TECH" | "EXECUTIVE_SOVEREIGN";

export interface OrganizationBranding {
  logoUrl?: string;
  brandColor?: string;
  secondaryColor?: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatorySignatureUrl?: string;
  officialStampUrl?: string;
  headerLayout?: "STANDARD" | "CENTERED" | "MODERN_MINIMAL" | "EXECUTIVE";
  templateTheme?: TemplateTheme;
  customOfferTerms?: string;
  customCertificateDisclaimer?: string;
}

export interface OrganizationSettings {
  workingDays: string[];
  expectedDailyHours: number;
  gracePeriodMinutes: number;
  allowedBreakMinutes: number;
  timeZone: string;
  dateFormat: string;
  primaryColor?: string;
  requireReportReview: boolean;
  autoApproveAttendance: boolean;
  requireDocumentApproval?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  code: string; // e.g. "ORG-7K4P9X"
  type: OrganizationType;
  status: OrganizationStatus;
  official_email: string;
  contact_number?: string;
  website?: string;
  country: string;
  size: string;
  industry_or_category: string;
  logo_url?: string;
  description: string;
  joining_policy: JoiningPolicy;
  allowed_email_domains: string[];
  settings: OrganizationSettings;
  branding?: OrganizationBranding;
  created_at: string;
  updated_at: string;
}

export interface OrganizationVerification {
  id: string;
  organization_id: string;
  method: "OFFICIAL_DOMAIN" | "WEBSITE_VERIFICATION" | "MANUAL_SUPERADMIN" | "DOCUMENTS";
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_evidence?: string;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  member_type: MemberType;
  status: MembershipStatus;
  department_id?: string;
  team_id?: string;
  job_title?: string;
  custom_profile?: Record<string, string | number | boolean>;
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields for convenience
  user_full_name?: string;
  user_email?: string;
  user_avatar?: string;
  organization_name?: string;
  organization_code?: string;
  organization_type?: OrganizationType;
  // Workforce & Mentorship Fields
  employee_id?: string;
  designation?: string;
  manager_id?: string;
  manager_name?: string;
  mentor_id?: string;
  mentor_name?: string;
  skills?: string[];
  employment_status?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "STUDENT";
  qualifications?: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  head_member_id?: string;
  created_at: string;
}

export interface Team {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  description?: string;
  lead_member_id?: string;
  created_at: string;
}

export interface Program {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: string;
  department_id?: string;
  technology: string;
  duration: string;
  start_date: string;
  end_date: string;
  capacity: number;
  enrolled_count: number;
  learning_outcomes: string[];
  curriculum_summary?: string;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  created_at: string;
}

export interface BatchCohort {
  id: string;
  organization_id: string;
  program_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "COMPLETED" | "UPCOMING";
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  team_id?: string;
  program_id?: string;
  name: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "REVIEW" | "COMPLETED";
  due_date?: string;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  project_id?: string;
  program_id?: string;
  title: string;
  description: string;
  assignee_id?: string;
  assignee_name?: string;
  reviewer_id?: string;
  priority: TaskPriority;
  status: TaskStatus;
  start_date?: string;
  due_date: string;
  estimated_effort?: string;
  acceptance_criteria?: string;
  comments_count?: number;
  comments?: Array<{
    id: string;
    author_name: string;
    text: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface WorkBreak {
  id: string;
  work_session_id: string;
  break_type: BreakType;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
}

export interface WorkSession {
  id: string;
  organization_id: string;
  member_id: string;
  member_name?: string;
  work_date: string;
  clock_in_at: string;
  clock_out_at?: string;
  status: WorkSessionStatus;
  total_seconds: number;
  productive_seconds: number;
  break_seconds: number;
  current_break_type?: BreakType;
  correction_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReportEntry {
  id: string;
  report_id: string;
  start_time: string;
  end_time: string;
  description: string;
}

export interface DailyReport {
  id: string;
  organization_id: string;
  member_id: string;
  member_name?: string;
  report_date: string;
  project_or_program: string;
  status: DailyReportStatus;
  activities: string;
  work_completed: string;
  challenges?: string;
  next_steps?: string;
  reviewer_id?: string;
  reviewer_feedback?: string;
  entries?: DailyReportEntry[];
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  organization_id: string;
  program_id?: string;
  title: string;
  description: string;
  content_type: "PDF" | "DOCUMENT" | "VIDEO" | "EXTERNAL_LINK" | "CODE_EXAMPLE" | "MODULE";
  category: string;
  url_or_path: string;
  tags: string[];
  estimated_duration: string;
  completed?: boolean;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  marks: number;
}

export interface Assessment {
  id: string;
  organization_id: string;
  program_id?: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  passing_threshold: number; // percentage, e.g. 70
  attempt_limit: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  questions: AssessmentQuestion[];
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  organization_id: string;
  assessment_id: string;
  member_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  submitted_at: string;
  answers: Record<string, string | string[]>;
}

export interface IssuedDocument {
  id: string;
  organization_id: string;
  member_id: string;
  document_number: string; // e.g. "IND-APX-2026-0042"
  document_type: DocumentType;
  title: string;
  recipient_name: string;
  recipient_role: string;
  issued_date: string;
  status: DocumentStatus;
  verification_code: string;
  approval_status?: "PENDING" | "APPROVED" | "REJECTED";
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  template_data: {
    organization_name: string;
    organization_type: OrganizationType;
    organization_logo?: string;
    organization_address?: string;
    organization_website?: string;
    signatory_name: string;
    signatory_title: string;
    signatory_signature?: string;
    official_stamp?: string;
    brand_color?: string;
    secondary_color?: string;
    contact_email?: string;
    contact_phone?: string;
    is_akash_template?: boolean;
    commencement_date?: string;
    continue_until_date?: string;
    technology?: string;
    program_or_track: string;
    grade_or_evaluation?: string;
    validity?: string;
    custom_terms?: string;
    stipend_or_compensation?: string;
    template_theme?: TemplateTheme;
    // Performance Transcript & Skills Dossier Attributes
    verified_work_hours?: number;
    attendance_percentage?: number;
    mentor_scores?: {
      technical: number;
      communication: number;
      initiative: number;
      overall: number;
    };
    completed_tasks_count?: number;
    assessments_passed_count?: number;
    verified_skills?: string[];
  };
  created_at: string;
  updated_at?: string;
}

export interface Announcement {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  target_scope: "ORG_WIDE" | "DEPARTMENT" | "TEAM" | "PROGRAM" | "BATCH";
  target_name?: string;
  author_name: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  created_at: string;
}

export interface SystemNotification {
  id: string;
  organization_id?: string;
  user_id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  actor_email: string;
  actor_role: string;
  action: string;
  resource: string;
  ip_address: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// ================= LEAVE MANAGEMENT =================
export type LeaveType = "CASUAL" | "SICK" | "ANNUAL" | "STUDY" | "EMERGENCY";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  organization_id: string;
  member_id: string;
  member_name: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

// ================= MENTORSHIP & PROGRESS REVIEWS =================
export interface MentorshipReview {
  id: string;
  organization_id: string;
  intern_id: string;
  intern_name: string;
  mentor_id: string;
  mentor_name: string;
  week_number: number;
  technical_score: number; // 1-10
  communication_score: number; // 1-10
  initiative_score: number; // 1-10
  feedback: string;
  milestone_status: "ON_TRACK" | "NEEDS_SUPPORT" | "EXCELLING";
  created_at: string;
}


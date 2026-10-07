export type UserRole = "ADMIN" | "STUDENT";

export type RegistrationStatus =
  | "REGISTERED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFIED"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED"
  | "SUSPENDED"
  | "CANCELLED";

export type WorkSessionStatus =
  | "NOT_STARTED"
  | "WORKING"
  | "ON_BREAK"
  | "COMPLETED";

export type BreakType = "LUNCH" | "WATER" | "PERSONAL" | "TEA" | "OTHER";

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type DailyReportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED"
  | "NEEDS_REVISION";

export type DocumentType =
  | "OFFER_LETTER"
  | "INTERNSHIP_LETTER"
  | "INTERNSHIP_CERTIFICATE"
  | "PAYMENT_RECEIPT";

export type DocumentStatus =
  | "NOT_ELIGIBLE"
  | "ELIGIBLE"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "GENERATED"
  | "AVAILABLE"
  | "REJECTED";

export interface Profile {
  id: string;
  auth_user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  mobile: string;
  avatar_url?: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  college: string;
  university: string;
  course: string;
  technology: string;
  internship_start?: string;
  internship_end?: string;
  registration_status: RegistrationStatus;
}

export interface Registration {
  id: string;
  student_id: string;
  application_number: string;
  status: RegistrationStatus;
  submitted_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  approved_by?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  registration_id: string;
  gateway: "RAZORPAY";
  order_id: string;
  payment_id?: string;
  amount: number; // in INR e.g. 1000
  currency: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  verified_at?: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  storage_path: string;
  generated_at: string;
}

export interface WorkSession {
  id: string;
  student_id: string;
  work_date: string; // YYYY-MM-DD
  clock_in_at: string;
  clock_out_at?: string;
  status: WorkSessionStatus;
  total_seconds: number;
  productive_seconds: number;
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

export interface DailyReport {
  id: string;
  student_id: string;
  report_date: string;
  status: DailyReportStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_comment?: string;
}

export interface DailyReportEntry {
  id: string;
  report_id: string;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  description: string;
}

export interface Task {
  id: string;
  student_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_at?: string;
  completed_at?: string;
  completion_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  technology: string;
  active: boolean;
  created_at: string;
}

export interface SubjectAssignment {
  id: string;
  subject_id: string;
  student_id: string;
  assigned_by: string;
  assigned_at: string;
}

export interface StudyMaterial {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  status: "PUBLISHED" | "ARCHIVED";
  uploaded_by: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  duration_minutes: number;
  passing_percentage: number;
  max_attempts: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order_index: number;
  version: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  option_index: number;
  is_correct?: boolean; // Must NEVER be exposed to student in exam endpoint!
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";
  score: number;
  percentage: number;
  passed: boolean;
}

export interface DocumentItem {
  id: string;
  student_id: string;
  type: DocumentType;
  status: DocumentStatus;
  document_number: string;
  storage_path?: string;
  issued_at?: string;
  approved_by?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_label: string;
  browser: string;
  os: string;
  ip_hash: string;
  last_active: string;
  created_at: string;
  is_current?: boolean;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: UserRole | "SYSTEM";
  action: string;
  entity_type: string;
  entity_id: string;
  old_status?: string;
  new_status?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

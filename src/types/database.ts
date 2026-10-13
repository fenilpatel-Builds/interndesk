export * from "./multitenant";

export type UserRole =
  | "ADMIN"
  | "STUDENT"
  | "SUPER_ADMIN"
  | "ORG_OWNER"
  | "ORG_ADMIN"
  | "HR_COORDINATOR"
  | "MANAGER_SUPERVISOR"
  | "TRAINER_MENTOR"
  | "EMPLOYEE"
  | "INTERN"
  | "AUDITOR";

export type RegistrationStatus =
  | "REGISTERED"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED"
  | "SUSPENDED"
  | "CANCELLED";

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

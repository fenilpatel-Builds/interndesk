/**
 * Akash Technolabs — Single Institute Activity & Submission Domain Types
 */

export type ActivityCategory =
  | "PROJECT_PRACTICUM"
  | "RESEARCH_PAPER"
  | "TECHNICAL_ASSESSMENT"
  | "LAB_EXERCISE"
  | "WORKSHOP_CHALLENGE";

export type ActivityStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type SubmissionStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVISION";

export interface InstituteActivity {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: ActivityCategory;
  departmentId: string;
  departmentName: string;
  courseName?: string;
  startDate: string;
  deadline: string;
  status: ActivityStatus;
  maxScore: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  activityTitle: string;
  studentId: string; // e.g. AKT-2026-081
  studentName: string;
  studentEmail: string;
  departmentId: string;
  reportContent: string;
  attachmentUrl?: string;
  status: SubmissionStatus;
  submittedAt: string;
  score?: number;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  feedback?: string;
  updatedAt: string;
}

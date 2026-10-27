/**
 * Akash Technolabs — Activity & Submission Persistence Store
 *
 * Provides thread-safe, disk-cached activity management with Supabase dual-sync.
 */

import fs from "fs";
import path from "path";
import { InstituteActivity, ActivitySubmission, ActivityStatus, SubmissionStatus } from "../../types/activity";
import { INSTITUTE_CONFIG } from "./config";
import { createAdminClient } from "../supabase/admin";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const ACTIVITIES_FILE = path.join(DATA_DIR, "institute-activities.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "activity-submissions.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }
}

// Initial seed activities for Akash Technolabs
const INITIAL_ACTIVITIES: InstituteActivity[] = [
  {
    id: "act-akt-01",
    title: "Full-Stack Enterprise Portal with Next.js 16 & Server Actions",
    description: "Design and implement a server-side rendered portal module with strict RBAC authorization and audit trails.",
    instructions: "1. Build responsive dashboard.\n2. Wire up secure server actions.\n3. Add unit tests with Vitest.\n4. Submit GitHub repository link and verification report.",
    category: "PROJECT_PRACTICUM",
    departmentId: "dept-cse",
    departmentName: "Computer Science & Engineering",
    courseName: "B.Tech in Computer Science & Engineering",
    startDate: "2026-10-01",
    deadline: "2026-11-15",
    status: "PUBLISHED",
    maxScore: 100,
    createdBy: "Akash Padhiyar (CEO)",
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "act-akt-02",
    title: "Convolutional Neural Network (CNN) Model for Image Classification",
    description: "Train, evaluate, and deploy an automated computer vision pipeline using PyTorch or TensorFlow.",
    instructions: "1. Preprocess custom image dataset.\n2. Achieve at least 92% validation accuracy.\n3. Export model artifacts and provide inference script.",
    category: "RESEARCH_PAPER",
    departmentId: "dept-aiml",
    departmentName: "Artificial Intelligence & Machine Learning",
    courseName: "B.Tech in Artificial Intelligence & Machine Learning",
    startDate: "2026-10-05",
    deadline: "2026-11-20",
    status: "PUBLISHED",
    maxScore: 100,
    createdBy: "Dr. Priya Sharma",
    createdAt: "2026-10-05T10:00:00.000Z",
    updatedAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "act-akt-03",
    title: "Containerized Microservices CI/CD Pipeline on AWS ECS",
    description: "Architect automated Docker container build and deployment workflows with health monitoring.",
    instructions: "1. Write optimized multi-stage Dockerfile.\n2. Configure GitHub Actions workflow.\n3. Document rollback and monitoring strategies.",
    category: "LAB_EXERCISE",
    departmentId: "dept-cloud",
    departmentName: "Cloud Computing & DevOps",
    courseName: "B.Tech in Information Technology",
    startDate: "2026-10-10",
    deadline: "2026-11-25",
    status: "PUBLISHED",
    maxScore: 100,
    createdBy: "Prof. Rajesh Varma",
    createdAt: "2026-10-10T09:30:00.000Z",
    updatedAt: "2026-10-10T09:30:00.000Z",
  },
  {
    id: "act-akt-04",
    title: "PostgreSQL Database Query Optimization & Indexing Benchmark",
    description: "Benchmark relational query performance under concurrent load and configure composite indexes.",
    instructions: "1. Analyze slow query EXPLAIN plans.\n2. Implement B-Tree & GIN indexes.\n3. Measure throughput improvement and submit benchmark report.",
    category: "TECHNICAL_ASSESSMENT",
    departmentId: "dept-it",
    departmentName: "Information Technology",
    courseName: "Master of Computer Applications (MCA)",
    startDate: "2026-10-15",
    deadline: "2026-11-30",
    status: "PUBLISHED",
    maxScore: 100,
    createdBy: "Fenil Patel",
    createdAt: "2026-10-15T11:00:00.000Z",
    updatedAt: "2026-10-15T11:00:00.000Z",
  },
];

// Initial seed submissions
const INITIAL_SUBMISSIONS: ActivitySubmission[] = [
  {
    id: "sub-akt-01",
    activityId: "act-akt-01",
    activityTitle: "Full-Stack Enterprise Portal with Next.js 16 & Server Actions",
    studentId: "AKT-2026-001",
    studentName: "Fenil Patel",
    studentEmail: "fenil.patel@akashtechnolabs.com",
    departmentId: "dept-cse",
    reportContent: "Completed end-to-end portal implementation with Next.js 16 App Router, Resend email OTP verification, and strict RBAC guards. All 93 Vitest unit tests passing cleanly.",
    attachmentUrl: "https://github.com/akashtechnolabs/interndesk",
    status: "APPROVED",
    submittedAt: "2026-10-20T14:30:00.000Z",
    score: 98,
    reviewerId: "usr-admin-akash",
    reviewerName: "Akash Padhiyar (CEO)",
    reviewedAt: "2026-10-22T10:15:00.000Z",
    feedback: "Exceptional architecture and test coverage. Clean separation of concerns and robust security boundaries.",
    updatedAt: "2026-10-22T10:15:00.000Z",
  },
  {
    id: "sub-akt-02",
    activityId: "act-akt-02",
    activityTitle: "Convolutional Neural Network (CNN) Model for Image Classification",
    studentId: "AKT-2026-002",
    studentName: "Priya Sharma",
    studentEmail: "priya.sharma@akashtechnolabs.com",
    departmentId: "dept-aiml",
    reportContent: "Trained ResNet-50 backbone on custom dataset. Achieved 94.2% test accuracy with data augmentation and CosineAnnealingLR scheduler.",
    attachmentUrl: "https://github.com/akashtechnolabs/cnn-classification",
    status: "SUBMITTED",
    submittedAt: "2026-10-25T16:00:00.000Z",
    updatedAt: "2026-10-25T16:00:00.000Z",
  },
];

function loadActivitiesFromDisk(): InstituteActivity[] {
  ensureDirectoryExists();
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    saveActivitiesToDisk(INITIAL_ACTIVITIES);
    return INITIAL_ACTIVITIES;
  }
  try {
    const raw = fs.readFileSync(ACTIVITIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

function saveActivitiesToDisk(activities: InstituteActivity[]) {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ActivityStore] Failed to save activities to disk:", err);
  }
}

function loadSubmissionsFromDisk(): ActivitySubmission[] {
  ensureDirectoryExists();
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    saveSubmissionsToDisk(INITIAL_SUBMISSIONS);
    return INITIAL_SUBMISSIONS;
  }
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

function saveSubmissionsToDisk(submissions: ActivitySubmission[]) {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ActivityStore] Failed to save submissions to disk:", err);
  }
}

class ActivityStore {
  public getActivities(filter?: { departmentId?: string; status?: ActivityStatus }): InstituteActivity[] {
    const list = loadActivitiesFromDisk();
    return list.filter((act) => {
      if (filter?.departmentId && act.departmentId !== filter.departmentId) return false;
      if (filter?.status && act.status !== filter.status) return false;
      return true;
    });
  }

  public getActivityById(id: string): InstituteActivity | null {
    const list = loadActivitiesFromDisk();
    return list.find((a) => a.id === id) || null;
  }

  public createActivity(
    data: Omit<InstituteActivity, "id" | "createdAt" | "updatedAt" | "startDate"> & { startDate?: string }
  ): InstituteActivity {
    const list = loadActivitiesFromDisk();
    const newActivity: InstituteActivity = {
      ...data,
      startDate: data.startDate || new Date().toISOString().split("T")[0],
      id: `act-akt-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newActivity);
    saveActivitiesToDisk(list);

    // Async sync to Supabase if configured
    this.syncActivityToSupabase(newActivity).catch(() => {});
    return newActivity;
  }

  public updateActivity(id: string, updates: Partial<InstituteActivity>): InstituteActivity | null {
    const list = loadActivitiesFromDisk();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveActivitiesToDisk(list);
    return list[idx];
  }

  public deleteActivity(id: string): boolean {
    const list = loadActivitiesFromDisk();
    const filtered = list.filter((a) => a.id !== id);
    if (filtered.length === list.length) return false;
    saveActivitiesToDisk(filtered);
    return true;
  }

  public getSubmissions(filter?: {
    activityId?: string;
    studentEmail?: string;
    studentId?: string;
    status?: SubmissionStatus;
    departmentId?: string;
  }): ActivitySubmission[] {
    const list = loadSubmissionsFromDisk();
    return list.filter((sub) => {
      if (filter?.activityId && sub.activityId !== filter.activityId) return false;
      if (filter?.studentEmail && sub.studentEmail.toLowerCase() !== filter.studentEmail.toLowerCase()) return false;
      if (filter?.studentId && sub.studentId !== filter.studentId) return false;
      if (filter?.status && sub.status !== filter.status) return false;
      if (filter?.departmentId && sub.departmentId !== filter.departmentId) return false;
      return true;
    });
  }

  public getSubmissionById(id: string): ActivitySubmission | null {
    const list = loadSubmissionsFromDisk();
    return list.find((s) => s.id === id) || null;
  }

  public createSubmission(data: {
    activityId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    reportContent: string;
    attachmentUrl?: string;
  }): ActivitySubmission {
    const list = loadSubmissionsFromDisk();
    const act = this.getActivityById(data.activityId);

    // Check for existing submission
    const existingIdx = list.findIndex(
      (s) => s.activityId === data.activityId && s.studentEmail.toLowerCase() === data.studentEmail.toLowerCase()
    );

    const now = new Date().toISOString();
    const id = existingIdx >= 0 ? list[existingIdx].id : `sub-akt-${Date.now().toString().slice(-6)}`;

    const submission: ActivitySubmission = {
      id,
      activityId: data.activityId,
      activityTitle: act?.title || "Institute Practical Activity",
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail.toLowerCase().trim(),
      departmentId: act?.departmentId || "dept-cse",
      reportContent: data.reportContent.trim(),
      attachmentUrl: data.attachmentUrl?.trim(),
      status: "SUBMITTED",
      submittedAt: now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = submission;
    } else {
      list.unshift(submission);
    }

    saveSubmissionsToDisk(list);
    return submission;
  }

  public reviewSubmission(
    id: string,
    review: {
      status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
      feedback: string;
      score?: number;
      reviewerName: string;
      reviewerId?: string;
    }
  ): ActivitySubmission | null {
    const list = loadSubmissionsFromDisk();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: review.status,
      feedback: review.feedback.trim(),
      score: review.score,
      reviewerName: review.reviewerName,
      reviewerId: review.reviewerId || "reviewer-admin",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSubmissionsToDisk(list);
    return list[idx];
  }

  private async syncActivityToSupabase(activity: InstituteActivity) {
    try {
      const adminClient = createAdminClient();
      await adminClient.from("activities").upsert({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        instructions: activity.instructions,
        category: activity.category,
        start_date: activity.startDate,
        deadline: activity.deadline,
        status: activity.status,
        created_at: activity.createdAt,
      });
    } catch {
      // Non-blocking sync
    }
  }
}

export const activityStore = new ActivityStore();

import fs from "fs";
import path from "path";
import { isUserAdmin } from "../auth/admin-whitelist";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  dueAt: string;
  technology: string;
  assignedToEmail: string;
  assignedToName: string;
  isGroupTask: boolean;
  groupId?: string;
  groupName?: string;
  groupMembers?: string[]; // Array of emails in the group project
  progress: number; // 0 to 100%
  completionNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

import { resolveDataFilePath } from "../data/storage-path";

const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const TASKS_FILE = resolveDataFilePath(isTestEnv ? "tasks.test.json" : "tasks.json");

function ensureDirectoryExists() {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "tsk-akt-01",
    title: "Implement Supabase Auth with Row Level Security",
    description: "Write zero-trust PostgreSQL policies ensuring students can query only their own profile and records.",
    priority: "HIGH",
    status: "COMPLETED",
    dueAt: "2026-11-10",
    technology: "PostgreSQL & RLS",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: false,
    progress: 100,
    completionNotes: "Completed RLS migrations with policy helper functions.",
    createdBy: "Akash Padhiyar (CEO)",
    createdAt: "2026-10-28T09:00:00.000Z",
    updatedAt: "2026-10-30T14:00:00.000Z",
  },
  {
    id: "tsk-akt-02",
    title: "Build Responsive Multi-Step Registration Flow",
    description: "Capture personal, academic, and internship specialization preferences with client & server Zod validation.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueAt: "2026-11-15",
    technology: "Next.js & Zod",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: false,
    progress: 75,
    completionNotes: "Created 4-step registration flow with email OTP verification.",
    createdBy: "Akash Padhiyar (CEO)",
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-11-01T11:00:00.000Z",
  },
  {
    id: "tsk-akt-03",
    title: "AI Model Fine-Tuning & Quantization",
    description: "Quantize LLM model checkpoints to 4-bit and benchmark inference speed on local test rigs.",
    priority: "URGENT",
    status: "PENDING",
    dueAt: "2026-11-20",
    technology: "PyTorch & Transformers",
    assignedToEmail: "fenil.patel@akashtechnolabs.com",
    assignedToName: "Fenil Patel",
    isGroupTask: false,
    progress: 20,
    createdBy: "Akash Padhiyar (CEO)",
    createdAt: "2026-11-01T08:30:00.000Z",
    updatedAt: "2026-11-01T08:30:00.000Z",
  },
  {
    id: "tsk-akt-04",
    title: "Full-Stack Enterprise Practicum Capstone — Group Project",
    description: "Collaborative project to architect a microservices-based activity system with live attendance clocking, encrypted tokens, and public cryptographic credentials.",
    priority: "URGENT",
    status: "IN_PROGRESS",
    dueAt: "2026-11-25",
    technology: "Next.js 16, TypeScript & Postgres",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: true,
    groupId: "grp-akt-fullstack",
    groupName: "Akash AI & Full-Stack Capstone Team",
    groupMembers: [
      "huntarmy001@gmail.com",
      "fenil.patel@akashtechnolabs.com",
      "priya.sharma@akashtechnolabs.com",
    ],
    progress: 60,
    completionNotes: "Initial modules and document generation completed. Currently completing group coordination.",
    createdBy: "Akash Padhiyar (CEO)",
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-11-02T16:00:00.000Z",
  },
];

function loadTasks(): TaskItem[] {
  ensureDirectoryExists();
  if (!fs.existsSync(TASKS_FILE)) {
    saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

function saveTasks(tasks: TaskItem[]) {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
  } catch (err) {
    console.warn("[TaskStore] Failed to save tasks:", err);
  }
}

export class TaskStore {
  /**
   * Scoped Task Retrieval:
   * - Admin/HR sees all tasks
   * - Students/Employees strictly see ONLY:
   *   1. Tasks privately assigned to them
   *   2. Group tasks where they are a member of the group
   */
  public getTasksForUser(userEmail?: string, userRole?: string): TaskItem[] {
    const all = loadTasks();
    if (!userEmail) return [];

    const cleanEmail = userEmail.toLowerCase().trim();
    const isAdmin = isUserAdmin(cleanEmail) || userRole === "ORG_ADMIN" || userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    if (isAdmin) {
      return all;
    }

    return all.filter((task) => {
      // 1. Personally assigned task
      if (task.assignedToEmail.toLowerCase().trim() === cleanEmail) {
        return true;
      }
      // 2. Group task where user is in groupMembers
      if (task.isGroupTask && Array.isArray(task.groupMembers)) {
        return task.groupMembers.some((m) => m.toLowerCase().trim() === cleanEmail);
      }
      return false;
    });
  }

  public getAll(): TaskItem[] {
    return loadTasks();
  }

  public getById(id: string): TaskItem | null {
    const all = loadTasks();
    return all.find((t) => t.id === id) || null;
  }

  public createTask(params: {
    title: string;
    description: string;
    priority?: TaskItem["priority"];
    dueAt: string;
    technology?: string;
    assignedToEmail: string;
    assignedToName: string;
    isGroupTask?: boolean;
    groupName?: string;
    groupMembers?: string[];
    createdBy?: string;
  }): TaskItem {
    const all = loadTasks();

    const isGroup = Boolean(params.isGroupTask);
    const members = isGroup && Array.isArray(params.groupMembers) ? params.groupMembers : [params.assignedToEmail];

    const newTask: TaskItem = {
      id: `tsk-akt-${Date.now().toString().slice(-6)}`,
      title: params.title.trim(),
      description: params.description.trim(),
      priority: params.priority || "MEDIUM",
      status: "PENDING",
      dueAt: params.dueAt,
      technology: params.technology?.trim() || "Full Stack & AI",
      assignedToEmail: params.assignedToEmail.trim().toLowerCase(),
      assignedToName: params.assignedToName.trim(),
      isGroupTask: isGroup,
      groupId: isGroup ? `grp-akt-${Date.now().toString().slice(-4)}` : undefined,
      groupName: isGroup ? params.groupName?.trim() || "Collaborative Project Team" : undefined,
      groupMembers: members.map((m) => m.toLowerCase().trim()),
      progress: 0,
      createdBy: params.createdBy || "Akash Padhiyar (CEO)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all.unshift(newTask);
    saveTasks(all);
    return newTask;
  }

  public updateTaskProgress(
    id: string,
    updates: {
      progress?: number;
      status?: TaskItem["status"];
      completionNotes?: string;
    }
  ): TaskItem | null {
    const all = loadTasks();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const task = all[idx];
    if (typeof updates.progress === "number") {
      task.progress = Math.min(100, Math.max(0, updates.progress));
      if (task.progress === 100) {
        task.status = "COMPLETED";
      } else if (task.progress > 0 && task.status === "PENDING") {
        task.status = "IN_PROGRESS";
      }
    }
    if (updates.status) {
      task.status = updates.status;
      if (updates.status === "COMPLETED" && task.progress < 100) {
        task.progress = 100;
      }
    }
    if (updates.completionNotes !== undefined) {
      task.completionNotes = updates.completionNotes;
    }
    task.updatedAt = new Date().toISOString();

    all[idx] = task;
    saveTasks(all);
    return task;
  }

  public deleteTask(id: string): boolean {
    const all = loadTasks();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    saveTasks(filtered);
    return true;
  }

  public deleteTasksForStudent(email: string): number {
    const all = loadTasks();
    const cleanEmail = email.toLowerCase().trim();
    const filtered = all.filter((t) => t.assignedToEmail.toLowerCase().trim() !== cleanEmail);
    if (filtered.length === all.length) return 0;
    saveTasks(filtered);
    return all.length - filtered.length;
  }
}

export const taskStore = new TaskStore();


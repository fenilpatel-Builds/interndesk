import fs from "fs";
import path from "path";
import { credentialsStore } from "../auth/credentials-store";

export interface StudentLiveAttendance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  technology: string;
  status: "WORKING" | "ON_BREAK" | "COMPLETED" | "NOT_CHECKED_IN";
  clockInTime: string | null;
  clockOutTime: string | null;
  currentBreak: string | null;
  breakDurationMinutes: number;
  workedMinutes: number;
  lastHeartbeat: string;
  location?: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const LIVE_ATTENDANCE_FILE = path.join(DATA_DIR, isTestEnv ? "live-attendance.test.json" : "live-attendance.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }
}

function loadLiveRecords(): Record<string, Partial<StudentLiveAttendance>> {
  ensureDirectoryExists();
  if (!fs.existsSync(LIVE_ATTENDANCE_FILE)) {
    // Seed initial live records
    const initial: Record<string, Partial<StudentLiveAttendance>> = {
      "huntarmy001@gmail.com": {
        status: "WORKING",
        clockInTime: "09:30 AM",
        clockOutTime: null,
        workedMinutes: 165,
        currentBreak: null,
        breakDurationMinutes: 15,
        lastHeartbeat: new Date().toISOString(),
      },
      "fenil.patel@akashtechnolabs.com": {
        status: "WORKING",
        clockInTime: "09:15 AM",
        clockOutTime: null,
        workedMinutes: 180,
        currentBreak: null,
        breakDurationMinutes: 10,
        lastHeartbeat: new Date().toISOString(),
      },
      "priya.sharma@akashtechnolabs.com": {
        status: "ON_BREAK",
        clockInTime: "10:00 AM",
        clockOutTime: null,
        currentBreak: "Lunch Break",
        breakDurationMinutes: 25,
        workedMinutes: 120,
        lastHeartbeat: new Date().toISOString(),
      },
    };
    saveLiveRecords(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(LIVE_ATTENDANCE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLiveRecords(records: Record<string, Partial<StudentLiveAttendance>>) {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(LIVE_ATTENDANCE_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.warn("[LiveAttendanceStore] Failed to save:", err);
  }
}

export class LiveAttendanceStore {
  public getAll(): StudentLiveAttendance[] {
    const records = loadLiveRecords();
    const accounts = credentialsStore.getAll().filter((a) => a.role === "STUDENT");

    const techMap: Record<string, string> = {
      "huntarmy001@gmail.com": "AI/ML Systems",
      "fenil.patel@akashtechnolabs.com": "AI/ML Engineering",
      "priya.sharma@akashtechnolabs.com": "Full Stack Web Development",
    };

    return accounts.map((acc, idx) => {
      const email = acc.email.toLowerCase().trim();
      const rec = records[email] || {};

      return {
        studentId: acc.id,
        studentName: acc.name,
        studentEmail: acc.email,
        technology: techMap[email] || "Computer Science",
        status: rec.status || "NOT_CHECKED_IN",
        clockInTime: rec.clockInTime || null,
        clockOutTime: rec.clockOutTime || null,
        currentBreak: rec.currentBreak || null,
        breakDurationMinutes: rec.breakDurationMinutes || 0,
        workedMinutes: rec.workedMinutes || 0,
        lastHeartbeat: rec.lastHeartbeat || new Date().toISOString(),
        location: rec.location || "Akash Technolabs Campus",
      };
    });
  }

  public updateStudentStatus(
    email: string,
    updates: Partial<StudentLiveAttendance>
  ): StudentLiveAttendance {
    const records = loadLiveRecords();
    const cleanEmail = email.toLowerCase().trim();

    const existing = records[cleanEmail] || {};
    const updated = {
      ...existing,
      ...updates,
      lastHeartbeat: new Date().toISOString(),
    };

    records[cleanEmail] = updated;
    saveLiveRecords(records);

    const all = this.getAll();
    const found = all.find((s) => s.studentEmail.toLowerCase().trim() === cleanEmail);
    if (found) return found;

    return {
      studentId: `usr-live-${cleanEmail.replace(/[^a-z0-9]/g, "")}`,
      studentName: cleanEmail.split("@")[0],
      studentEmail: cleanEmail,
      technology: "Information Technology",
      status: updated.status || "NOT_CHECKED_IN",
      clockInTime: updated.clockInTime || null,
      clockOutTime: updated.clockOutTime || null,
      currentBreak: updated.currentBreak || null,
      breakDurationMinutes: updated.breakDurationMinutes || 0,
      workedMinutes: updated.workedMinutes || 0,
      lastHeartbeat: updated.lastHeartbeat || new Date().toISOString(),
      location: updated.location || "Akash Technolabs Campus",
    };
  }
}

export const liveAttendanceStore = new LiveAttendanceStore();

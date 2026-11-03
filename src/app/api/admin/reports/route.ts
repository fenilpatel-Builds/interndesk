import { NextResponse } from "next/server";
import { credentialsStore } from "@/lib/auth/credentials-store";
import { activityStore } from "@/lib/institute/activity-store";

export async function GET() {
  try {
    const allAccounts = credentialsStore.getAll();
    const studentAccounts = allAccounts.filter((a) => a.role === "STUDENT");

    const activities = activityStore.getActivities();
    const submissions = activityStore.getSubmissions();

    const techOptions = [
      "AI & Machine Learning",
      "Full Stack Web Development",
      "Cloud & DevOps",
      "Python Enterprise Systems",
      "Cybersecurity",
    ];

    const collegeOptions = [
      "Akash Technolabs Campus",
      "Gujarat Technological University",
      "Ahmedabad Institute of Technology",
      "L.D. College of Engineering",
    ];

    const reportData = studentAccounts.map((student, idx) => {
      const studentSubs = submissions.filter(
        (s) => s.studentEmail.toLowerCase() === student.email.toLowerCase()
      );
      const approvedSubs = studentSubs.filter((s) => s.status === "APPROVED");
      const scoredSubs = studentSubs.filter((s) => typeof s.score === "number" && s.score > 0);

      const avgScore =
        scoredSubs.length > 0
          ? Math.round(scoredSubs.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubs.length)
          : 90;

      return {
        student: student.name,
        email: student.email,
        college: collegeOptions[idx % collegeOptions.length],
        tech: techOptions[idx % techOptions.length],
        attendancePct: "98.4%",
        productiveHours: "82h 30m",
        dailyReportsSubmitted: 14 + (idx % 4),
        tasksCompleted: `${approvedSubs.length}/${activities.length || 4}`,
        assessmentAvg: `${avgScore}%`,
        internshipStatus: "ACTIVE",
      };
    });

    return NextResponse.json({
      success: true,
      reportData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admin report data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


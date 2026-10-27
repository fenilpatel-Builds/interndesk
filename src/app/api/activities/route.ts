import { NextRequest, NextResponse } from "next/server";
import { activityStore } from "@/lib/institute/activity-store";
import { safeParseSession } from "@/lib/auth/session-token";
import { ActivityStatus, ActivityCategory } from "@/types/activity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const status = (searchParams.get("status") as ActivityStatus) || undefined;

    const activities = activityStore.getActivities({ departmentId, status });
    return NextResponse.json({ success: true, activities });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve activities.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("interndesk_user")?.value;
    const session = safeParseSession(sessionCookie);

    // Only admin or faculty can create activities
    if (!session || (session.role !== "ORG_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "TRAINER_MENTOR")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Administrator or faculty credentials required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, instructions, category, departmentId, departmentName, courseName, startDate, deadline, maxScore } = body;

    if (!title || !description || !deadline) {
      return NextResponse.json(
        { success: false, message: "Activity title, description, and deadline are required." },
        { status: 400 }
      );
    }

    const activity = activityStore.createActivity({
      title: String(title).trim(),
      description: String(description).trim(),
      instructions: String(instructions || "").trim(),
      category: (category as ActivityCategory) || "PROJECT_PRACTICUM",
      departmentId: departmentId || "dept-cse",
      departmentName: departmentName || "Computer Science & Engineering",
      courseName: courseName || "B.Tech in Computer Science & Engineering",
      startDate: startDate || new Date().toISOString().split("T")[0],
      deadline: deadline,
      status: "PUBLISHED",
      maxScore: Number(maxScore) || 100,
      createdBy: session.name || "Akash Padhiyar",
    });

    return NextResponse.json({
      success: true,
      message: "Academic activity published successfully.",
      activity,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create activity.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

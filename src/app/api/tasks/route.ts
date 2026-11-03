import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { taskStore } from "@/lib/tasks/task-store";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const searchParams = req.nextUrl.searchParams;
    const queryEmail = searchParams.get("email");

    const email = queryEmail || session?.email;
    const role = session?.role || "STUDENT";

    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const tasks = taskStore.getTasksForUser(email, role);

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load tasks";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const body = await req.json();

    const creatorEmail = session?.email || body.creatorEmail;
    const isAdmin =
      isUserAdmin(creatorEmail) ||
      session?.role === "SUPER_ADMIN" ||
      session?.role === "ORG_OWNER" ||
      session?.role === "HR_COORDINATOR";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Only administrators or HR coordinators can assign tasks." },
        { status: 403 }
      );
    }

    if (!body.title || !body.assignedToEmail || !body.dueAt) {
      return NextResponse.json(
        { error: "Title, Assigned Student Email, and Due Date are required." },
        { status: 400 }
      );
    }

    const newTask = taskStore.createTask({
      title: body.title,
      description: body.description || "",
      priority: body.priority || "MEDIUM",
      dueAt: body.dueAt,
      technology: body.technology || "Full Stack & AI",
      assignedToEmail: body.assignedToEmail,
      assignedToName: body.assignedToName || body.assignedToEmail.split("@")[0],
      isGroupTask: Boolean(body.isGroupTask),
      groupName: body.groupName,
      groupMembers: body.groupMembers,
      createdBy: session?.name ? `${session.name} (Admin)` : "Akash Technolabs Admin",
    });

    return NextResponse.json({
      success: true,
      task: newTask,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

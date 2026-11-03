import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { taskStore } from "@/lib/tasks/task-store";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const body = await req.json();

    const task = taskStore.getById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const email = session?.email?.toLowerCase().trim();
    const isAdmin =
      isUserAdmin(email) ||
      session?.role === "SUPER_ADMIN" ||
      session?.role === "ORG_OWNER" ||
      session?.role === "HR_COORDINATOR";
    const isAssignee = email && task.assignedToEmail.toLowerCase().trim() === email;
    const isGroupMember =
      email &&
      task.isGroupTask &&
      Array.isArray(task.groupMembers) &&
      task.groupMembers.some((m) => m.toLowerCase().trim() === email);

    // Permission check: only assigned student, group member, or admin can update task progress
    if (!isAdmin && !isAssignee && !isGroupMember) {
      return NextResponse.json(
        { error: "Access Denied: You do not have permission to modify this task." },
        { status: 403 }
      );
    }

    const updated = taskStore.updateTaskProgress(id, {
      progress: body.progress,
      status: body.status,
      completionNotes: body.completionNotes,
    });

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update task";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const email = session?.email?.toLowerCase().trim();
    const isAdmin =
      isUserAdmin(email) ||
      session?.role === "SUPER_ADMIN" ||
      session?.role === "ORG_OWNER" ||
      session?.role === "HR_COORDINATOR";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Only administrators can delete tasks." },
        { status: 403 }
      );
    }

    const ok = taskStore.deleteTask(id);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete task";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

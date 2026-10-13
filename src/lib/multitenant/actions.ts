"use server";

import { cookies } from "next/headers";
import { dbService } from "./db-service";
import {
  resolveAuthenticatedUser,
  resolveAuthenticatedTenantContext,
  requirePermission,
} from "./auth-guard";
import { BreakType, MemberRole, TaskStatus, LeaveType } from "../../types/multitenant";

export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Creates a new organization workspace and sets current user as owner.
 */
export async function createOrganizationAction(formData: {
  name: string;
  type: "CORPORATE" | "EDUCATIONAL" | "TRAINING" | "INTERNSHIP_PROVIDER" | "HYBRID";
  official_email: string;
  industry_or_category: string;
  country?: string;
  website?: string;
  description?: string;
}): Promise<ServerActionResult> {
  try {
    const user = await resolveAuthenticatedUser();
    const creatorEmail = user?.email || formData.official_email;

    const org = await dbService.createOrganization({
      ...formData,
      creator_email: creatorEmail,
    });

    // Set as active workspace cookie
    const cookieStore = await cookies();
    cookieStore.set("interndesk_active_org", org.id, {
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      data: org,
      message: `Organization "${org.name}" registered successfully with code ${org.code}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to create organization";
    return { success: false, error };
  }
}

/**
 * Super Admin verification action for organizations.
 */
export async function verifyOrganizationAction(
  orgId: string,
  status: "APPROVED" | "REJECTED" | "SUSPENDED",
  notes?: string
): Promise<ServerActionResult> {
  try {
    const user = await resolveAuthenticatedUser();
    if (!user?.isSuperAdmin) {
      return { success: false, error: "Only Platform Super Admins can verify organizations." };
    }

    const updated = await dbService.verifyOrganization(orgId, status, notes);
    if (!updated) {
      return { success: false, error: "Organization not found" };
    }

    return {
      success: true,
      data: updated,
      message: `Organization status updated to ${status}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to verify organization";
    return { success: false, error };
  }
}

/**
 * Join an organization by Organization Code.
 */
export async function joinOrganizationByCodeAction(
  code: string,
  desiredRole: MemberRole = "INTERN"
): Promise<ServerActionResult> {
  try {
    const org = await dbService.getOrganizationByCode(code);
    if (!org) {
      return { success: false, error: `No active organization found matching code "${code}".` };
    }

    if (org.status === "SUSPENDED") {
      return { success: false, error: "This organization is currently suspended." };
    }

    const user = await resolveAuthenticatedUser();
    const userEmail = user?.email || "applicant@domain.com";
    const userFullName = userEmail.split("@")[0];

    // Joining Policy check
    if (org.joining_policy === "INVITATION_ONLY") {
      return {
        success: false,
        error: `Organization "${org.name}" accepts members via verified invitation token only.`,
      };
    }

    if (org.joining_policy === "REQUEST_APPROVAL") {
      return {
        success: true,
        data: { organization: org, pendingApproval: true },
        message: `Your membership request for "${org.name}" has been submitted for administrator review.`,
      };
    }

    // CODE_ONLY or OPEN_VERIFIED: instant membership creation
    const membership = await dbService.createMembership({
      organization_id: org.id,
      user_id: user?.userId || `usr-${Date.now()}`,
      user_email: userEmail,
      user_full_name: userFullName,
      role: desiredRole,
      member_type: desiredRole === "STUDENT" ? "STUDENT" : "INTERN",
      job_title: `${desiredRole} (Joined with Org Code)`,
    });

    const cookieStore = await cookies();
    cookieStore.set("interndesk_active_org", org.id, {
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      data: { organization: org, membership },
      message: `Successfully joined "${org.name}"!`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to join organization";
    return { success: false, error };
  }
}

/**
 * Switches the active workspace tenant cookie.
 */
export async function switchActiveWorkspaceAction(orgId: string): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    const cookieStore = await cookies();
    cookieStore.set("interndesk_active_org", orgId, {
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      data: context.organization,
      message: `Active workspace switched to "${context.organization.name}".`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to switch workspace";
    return { success: false, error };
  }
}

/**
 * Attendance Clock-In Action
 */
export async function clockInAction(orgId: string): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "attendance.clock");

    const memberId = context.membership?.id || context.user.userId;
    const memberName = context.membership?.user_full_name || context.user.email.split("@")[0];

    const result = await dbService.recordClockIn(orgId, memberId, memberName);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: result.session,
      message: "Clock-in recorded. Work session initiated.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Clock-in failed";
    return { success: false, error };
  }
}

/**
 * Attendance Take Break Action
 */
export async function takeBreakAction(orgId: string, sessionId: string, breakType: BreakType): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "attendance.clock");

    const result = await dbService.recordBreak(orgId, sessionId, breakType);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: result.session,
      message: `Break (${breakType}) started.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Break initiation failed";
    return { success: false, error };
  }
}

/**
 * Attendance Resume Work Action
 */
export async function resumeWorkAction(orgId: string, sessionId: string): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "attendance.clock");

    const result = await dbService.recordResume(orgId, sessionId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: result.session,
      message: "Resumed active work session.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Resume failed";
    return { success: false, error };
  }
}

/**
 * Attendance Clock-Out Action
 */
export async function clockOutAction(orgId: string, sessionId: string): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "attendance.clock");

    const result = await dbService.recordClockOut(orgId, sessionId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: result.session,
      message: "Clock-out recorded. Session closed with server-calculated productive duration.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Clock-out failed";
    return { success: false, error };
  }
}

/**
 * Daily Report Submission Action
 */
export async function submitDailyReportAction(
  orgId: string,
  reportData: {
    report_date: string;
    project_or_program: string;
    activities: string;
    work_completed: string;
    challenges?: string;
    next_steps?: string;
  }
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "reports.submit");

    const memberId = context.membership?.id || context.user.userId;
    const memberName = context.membership?.user_full_name || context.user.email.split("@")[0];

    const report = await dbService.submitDailyReport({
      organization_id: orgId,
      member_id: memberId,
      member_name: memberName,
      report_date: reportData.report_date,
      project_or_program: reportData.project_or_program,
      activities: reportData.activities,
      work_completed: reportData.work_completed,
      challenges: reportData.challenges,
      next_steps: reportData.next_steps,
    });

    return {
      success: true,
      data: report,
      message: "Daily report submitted for supervisor review.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Daily report submission failed";
    return { success: false, error };
  }
}

/**
 * Daily Report Review Action
 */
export async function reviewDailyReportAction(
  orgId: string,
  reportId: string,
  status: "APPROVED" | "NEEDS_REVISION",
  feedback: string
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "reports.review");

    const reviewerId = context.membership?.id || context.user.userId;
    const updated = await dbService.reviewDailyReport(orgId, reportId, status, feedback, reviewerId);

    if (!updated) {
      return { success: false, error: "Report not found" };
    }

    return {
      success: true,
      data: updated,
      message: `Report status updated to ${status}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Report review failed";
    return { success: false, error };
  }
}

/**
 * Task Management Actions
 */
export async function createTaskAction(
  orgId: string,
  taskData: {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignee_id?: string;
    assignee_name?: string;
    due_date?: string;
  }
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "tasks.create");

    const task = await dbService.createTask({
      organization_id: orgId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: "PENDING",
      assignee_id: taskData.assignee_id,
      assignee_name: taskData.assignee_name,
      due_date: taskData.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    });

    return {
      success: true,
      data: task,
      message: "Task created successfully.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Task creation failed";
    return { success: false, error };
  }
}

export async function updateTaskStatusAction(
  orgId: string,
  taskId: string,
  status: TaskStatus
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "tasks.update_own");

    const task = await dbService.updateTaskStatus(orgId, taskId, status);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return {
      success: true,
      data: task,
      message: `Task status updated to ${status}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to update task status";
    return { success: false, error };
  }
}

/**
 * Assessment Exam Attempt Action
 */
export async function submitAssessmentAttemptAction(
  orgId: string,
  assessmentId: string,
  answers: Record<string, string | string[]>
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "assessments.take");

    const memberId = context.membership?.id || context.user.userId;
    const result = await dbService.submitAssessmentAttempt(orgId, assessmentId, memberId, answers);

    if (!result.success || !result.attempt) {
      return { success: false, error: result.error || "Failed to submit assessment" };
    }

    const { attempt } = result;
    return {
      success: true,
      data: attempt,
      message: `Assessment evaluated: Score ${attempt.score}/${attempt.total_marks} (${attempt.percentage}%). Passed: ${attempt.passed}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Assessment submission failed";
    return { success: false, error };
  }
}

/**
 * Leave Management Actions
 */
export async function submitLeaveRequestAction(
  orgId: string,
  leaveData: {
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
  }
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    const memberId = context.membership?.id || context.user.userId;
    const memberName = context.membership?.user_full_name || context.user.email.split("@")[0];

    const leave = await dbService.submitLeaveRequest({
      organization_id: orgId,
      member_id: memberId,
      member_name: memberName,
      leave_type: leaveData.leave_type,
      start_date: leaveData.start_date,
      end_date: leaveData.end_date,
      days_count: leaveData.days_count,
      reason: leaveData.reason,
    });

    return {
      success: true,
      data: leave,
      message: "Leave request submitted for administrative review.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to submit leave request";
    return { success: false, error };
  }
}

export async function reviewLeaveRequestAction(
  orgId: string,
  leaveId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "members.manage");

    const reviewerName = context.membership?.user_full_name || context.user.email;
    const updated = await dbService.reviewLeaveRequest(orgId, leaveId, status, notes, reviewerName);

    if (!updated) {
      return { success: false, error: "Leave request not found" };
    }

    return {
      success: true,
      data: updated,
      message: `Leave request status updated to ${status}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to review leave request";
    return { success: false, error };
  }
}

/**
 * Mentorship Review Actions
 */
export async function submitMentorshipReviewAction(
  orgId: string,
  reviewData: {
    intern_id: string;
    intern_name: string;
    week_number: number;
    technical_score: number;
    communication_score: number;
    initiative_score: number;
    feedback: string;
    milestone_status: "ON_TRACK" | "NEEDS_SUPPORT" | "EXCELLING";
  }
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "members.manage");

    const mentorId = context.membership?.id || context.user.userId;
    const mentorName = context.membership?.user_full_name || context.user.email;

    const review = await dbService.submitMentorshipReview({
      organization_id: orgId,
      intern_id: reviewData.intern_id,
      intern_name: reviewData.intern_name,
      mentor_id: mentorId,
      mentor_name: mentorName,
      week_number: reviewData.week_number,
      technical_score: reviewData.technical_score,
      communication_score: reviewData.communication_score,
      initiative_score: reviewData.initiative_score,
      feedback: reviewData.feedback,
      milestone_status: reviewData.milestone_status,
    });

    return {
      success: true,
      data: review,
      message: "Weekly mentorship review recorded.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to submit mentorship review";
    return { success: false, error };
  }
}

/**
 * Task Comment Action
 */
export async function addTaskCommentAction(
  orgId: string,
  taskId: string,
  text: string
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    const authorName = context.membership?.user_full_name || context.user.email;

    const task = await dbService.addTaskComment(orgId, taskId, authorName, text);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return {
      success: true,
      data: task,
      message: "Comment added to task.",
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to add comment";
    return { success: false, error };
  }
}

/**
 * Member Status Action (Activation / Suspension)
 */
export async function toggleMembershipStatusAction(
  orgId: string,
  memberId: string
): Promise<ServerActionResult> {
  try {
    const context = await resolveAuthenticatedTenantContext(orgId);
    requirePermission(context.role, "members.manage");

    const member = await dbService.toggleMembershipStatus(memberId);
    if (!member) {
      return { success: false, error: "Member not found" };
    }

    return {
      success: true,
      data: member,
      message: `Member status updated to ${member.status}.`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to toggle member status";
    return { success: false, error };
  }
}

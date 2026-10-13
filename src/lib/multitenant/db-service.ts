import { createAdminClient } from "../supabase/admin";
import { multiTenantStore } from "./store";
import {
  Organization,
  OrganizationMembership,
  MemberRole,
  Task,
  TaskStatus,
  WorkSession,
  DailyReport,
  LearningMaterial,
  Assessment,
  AssessmentAttempt,
  IssuedDocument,
  AuditLog,
  BreakType,
  LeaveRequest,
  MentorshipReview,
} from "../../types/multitenant";
import { generateOrganizationCode, validateOrganizationCode } from "./code-generator";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(
    url &&
    key &&
    !url.includes("dummy.supabase.co") &&
    !key.includes("dummy-service-role-key")
  );
}

export class MultiTenantDatabaseService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = isSupabaseConfigured();
  }

  // ================= ORGANIZATIONS =================

  public async getOrganizations(): Promise<Organization[]> {
    if (!this.isConfigured) {
      return multiTenantStore.getOrganizations();
    }

    try {
      const admin = createAdminClient();
      const { data, error } = await admin.from("organizations").select("*");
      if (error || !data || data.length === 0) {
        return multiTenantStore.getOrganizations();
      }
      return data as Organization[];
    } catch {
      return multiTenantStore.getOrganizations();
    }
  }

  public async getOrganizationById(id: string): Promise<Organization | null> {
    if (!this.isConfigured) {
      return multiTenantStore.getOrganizationById(id) || null;
    }

    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("organizations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        return multiTenantStore.getOrganizationById(id) || null;
      }
      return data as Organization;
    } catch {
      return multiTenantStore.getOrganizationById(id) || null;
    }
  }

  public async getOrganizationByCode(code: string): Promise<Organization | null> {
    const { isValid, normalized } = validateOrganizationCode(code);
    if (!isValid) return null;

    if (!this.isConfigured) {
      return multiTenantStore.getOrganizationByCode(normalized) || null;
    }

    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("organizations")
        .select("*")
        .eq("code", normalized)
        .maybeSingle();

      if (error || !data) {
        return multiTenantStore.getOrganizationByCode(normalized) || null;
      }
      return data as Organization;
    } catch {
      return multiTenantStore.getOrganizationByCode(normalized) || null;
    }
  }

  public async createOrganization(data: {
    name: string;
    slug?: string;
    type: Organization["type"];
    official_email: string;
    industry_or_category: string;
    country?: string;
    size?: string;
    website?: string;
    description?: string;
    creator_email?: string;
  }): Promise<Organization> {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const code = generateOrganizationCode();

    if (!this.isConfigured) {
      const newOrg = multiTenantStore.createOrganization({
        name: data.name,
        slug,
        type: data.type,
        official_email: data.official_email,
        contact_number: "+1 (555) 000-0000",
        website: data.website || `https://${slug}.com`,
        country: data.country || "United States",
        size: data.size || "50-200",
        industry_or_category: data.industry_or_category,
        description: data.description || `${data.name} organization workspace on InternDesk.`,
        joining_policy: "REQUEST_APPROVAL",
        allowed_email_domains: [`@${data.official_email.split("@")[1] || "org.io"}`],
        settings: {
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          expectedDailyHours: 8,
          gracePeriodMinutes: 15,
          allowedBreakMinutes: 60,
          timeZone: "America/New_York",
          dateFormat: "MM/DD/YYYY",
          primaryColor: "#2563EB",
          requireReportReview: true,
          autoApproveAttendance: false,
        },
      });

      // Also create initial owner membership
      if (data.creator_email) {
        multiTenantStore.addMembership({
          organization_id: newOrg.id,
          user_id: `usr-${Date.now()}`,
          user_email: data.creator_email,
          user_full_name: data.creator_email.split("@")[0],
          role: "ORG_OWNER",
          member_type: "ADMIN",
          status: "ACTIVE",
          job_title: "Workspace Founder & Administrator",
          joined_at: new Date().toISOString(),
        });
      }

      return newOrg;
    }

    try {
      const admin = createAdminClient();
      const { data: inserted, error } = await admin
        .from("organizations")
        .insert({
          name: data.name,
          slug,
          code,
          type: data.type,
          official_email: data.official_email,
          industry_or_category: data.industry_or_category,
          country: data.country || "United States",
          size: data.size || "50-200",
          website: data.website || `https://${slug}.com`,
          description: data.description || `${data.name} workspace.`,
          joining_policy: "REQUEST_APPROVAL",
          status: "VERIFICATION_PENDING",
        })
        .select()
        .single();

      if (error || !inserted) {
        throw new Error(error?.message || "Failed to create organization in database");
      }

      return inserted as Organization;
    } catch {
      // Graceful fallback to memory store
      return multiTenantStore.createOrganization({
        name: data.name,
        slug,
        type: data.type,
        official_email: data.official_email,
        contact_number: "+1 (555) 000-0000",
        website: data.website || `https://${slug}.com`,
        country: data.country || "United States",
        size: data.size || "50-200",
        industry_or_category: data.industry_or_category,
        description: data.description || `${data.name} workspace.`,
        joining_policy: "REQUEST_APPROVAL",
        allowed_email_domains: [],
        settings: {
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          expectedDailyHours: 8,
          gracePeriodMinutes: 15,
          allowedBreakMinutes: 60,
          timeZone: "America/New_York",
          dateFormat: "MM/DD/YYYY",
          primaryColor: "#2563EB",
          requireReportReview: true,
          autoApproveAttendance: false,
        },
      });
    }
  }

  public async verifyOrganization(
    orgId: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED",
    notes?: string
  ): Promise<Organization | null> {
    const updated = multiTenantStore.verifyOrganization(orgId, status, notes);
    if (!this.isConfigured) {
      return updated || null;
    }

    try {
      const admin = createAdminClient();
      await admin
        .from("organizations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orgId);
    } catch {
      // Non-blocking sync
    }

    return updated || null;
  }

  // ================= MEMBERSHIPS & INVITATIONS =================

  public async getMemberships(organizationId: string): Promise<OrganizationMembership[]> {
    if (!this.isConfigured) {
      return multiTenantStore.getMemberships(organizationId);
    }

    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("organization_memberships")
        .select("*")
        .eq("organization_id", organizationId);

      if (error || !data || data.length === 0) {
        return multiTenantStore.getMemberships(organizationId);
      }
      return data as OrganizationMembership[];
    } catch {
      return multiTenantStore.getMemberships(organizationId);
    }
  }

  public async createMembership(data: {
    organization_id: string;
    user_id: string;
    user_email: string;
    user_full_name: string;
    role: MemberRole;
    member_type: OrganizationMembership["member_type"];
    job_title?: string;
  }): Promise<OrganizationMembership> {
    const mem = multiTenantStore.addMembership({
      ...data,
      status: "ACTIVE",
      joined_at: new Date().toISOString(),
    });

    if (this.isConfigured) {
      try {
        const admin = createAdminClient();
        await admin.from("organization_memberships").insert({
          organization_id: data.organization_id,
          user_id: data.user_id,
          role: data.role,
          member_type: data.member_type,
          job_title: data.job_title,
          status: "ACTIVE",
        });
      } catch {
        // Fallback
      }
    }

    return mem;
  }

  public async validateInvitation(token: string) {
    return multiTenantStore.validateInvitationToken(token);
  }

  public async acceptInvitation(token: string, userEmail: string, userFullName: string) {
    const validation = multiTenantStore.validateInvitationToken(token);
    if (!validation.valid || !validation.organization) {
      return { success: false, error: validation.error || "Invalid invitation" };
    }

    const membership = multiTenantStore.addMembership({
      organization_id: validation.organization.id,
      user_id: `usr-${Date.now()}`,
      user_email: userEmail,
      user_full_name: userFullName,
      role: validation.role || "INTERN",
      member_type: validation.role === "STUDENT" ? "STUDENT" : "INTERN",
      status: "ACTIVE",
      job_title: `${validation.role} (Joined via verified invitation)`,
      joined_at: new Date().toISOString(),
    });

    return {
      success: true,
      organization: validation.organization,
      membership,
    };
  }

  // ================= ATTENDANCE & WORK SESSIONS =================

  public async getWorkSessions(organizationId: string, memberId?: string): Promise<WorkSession[]> {
    return multiTenantStore.getWorkSessions(organizationId, memberId);
  }

  public async recordClockIn(organizationId: string, memberId: string, memberName: string) {
    const existing = multiTenantStore.getActiveWorkSession(organizationId, memberId);
    if (existing) {
      return { success: false, error: "Active work session already running." };
    }

    const newSession = multiTenantStore.clockIn(organizationId, memberId, memberName);
    return { success: true, session: newSession };
  }

  public async recordBreak(organizationId: string, sessionId: string, breakType: BreakType) {
    const session = multiTenantStore.startBreak(organizationId, sessionId, breakType);
    if (!session) {
      return { success: false, error: "Failed to initiate break on session." };
    }
    return { success: true, session };
  }

  public async recordResume(organizationId: string, sessionId: string) {
    const session = multiTenantStore.resumeBreak(organizationId, sessionId);
    if (!session) {
      return { success: false, error: "Failed to resume working session." };
    }
    return { success: true, session };
  }

  public async recordClockOut(organizationId: string, sessionId: string) {
    const session = multiTenantStore.clockOut(organizationId, sessionId);
    if (!session) {
      return { success: false, error: "Failed to complete work session." };
    }
    return { success: true, session };
  }

  // ================= TASKS =================

  public async getTasks(organizationId: string, memberId?: string): Promise<Task[]> {
    return multiTenantStore.getTasks(organizationId, memberId);
  }

  public async createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    return multiTenantStore.createTask(data);
  }

  public async updateTaskStatus(organizationId: string, taskId: string, status: TaskStatus): Promise<Task | null> {
    const updated = multiTenantStore.updateTaskStatus(organizationId, taskId, status);
    return updated || null;
  }

  // ================= DAILY REPORTS =================

  public async getDailyReports(organizationId: string, memberId?: string): Promise<DailyReport[]> {
    return multiTenantStore.getDailyReports(organizationId, memberId);
  }

  public async submitDailyReport(
    data: Omit<DailyReport, "id" | "status" | "created_at">
  ): Promise<DailyReport> {
    return multiTenantStore.submitDailyReport(data);
  }

  public async reviewDailyReport(
    organizationId: string,
    reportId: string,
    status: "APPROVED" | "NEEDS_REVISION",
    feedback: string,
    reviewerId: string
  ): Promise<DailyReport | null> {
    const updated = multiTenantStore.reviewDailyReport(organizationId, reportId, status, feedback, reviewerId);
    return updated || null;
  }

  // ================= LEARNING & ASSESSMENTS =================

  public async getLearningMaterials(organizationId: string): Promise<LearningMaterial[]> {
    return multiTenantStore.getLearningMaterials(organizationId);
  }

  public async getAssessments(organizationId: string): Promise<Assessment[]> {
    return multiTenantStore.getAssessments(organizationId);
  }

  public async submitAssessmentAttempt(
    organizationId: string,
    assessmentId: string,
    memberId: string,
    answers: Record<string, string | string[]>
  ): Promise<{ success: boolean; attempt?: AssessmentAttempt; error?: string }> {
    try {
      const attempt = multiTenantStore.submitAssessmentAttempt(
        organizationId,
        assessmentId,
        memberId,
        answers
      );
      return { success: true, attempt };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Assessment submission failed";
      return { success: false, error: message };
    }
  }

  // ================= DOCUMENTS & CERTIFICATES =================

  public async getIssuedDocuments(organizationId: string, memberId?: string): Promise<IssuedDocument[]> {
    return multiTenantStore.getIssuedDocuments(organizationId, memberId);
  }

  public async verifyDocumentByNumber(documentNumber: string): Promise<IssuedDocument | null> {
    return multiTenantStore.verifyDocumentByNumber(documentNumber) || null;
  }

  // ================= LEAVE MANAGEMENT =================

  public async getLeaveRequests(organizationId: string, memberId?: string): Promise<LeaveRequest[]> {
    return multiTenantStore.getLeaveRequests(organizationId, memberId);
  }

  public async submitLeaveRequest(
    data: Omit<LeaveRequest, "id" | "status" | "created_at">
  ): Promise<LeaveRequest> {
    return multiTenantStore.submitLeaveRequest(data);
  }

  public async reviewLeaveRequest(
    organizationId: string,
    leaveId: string,
    status: "APPROVED" | "REJECTED",
    notes?: string,
    reviewerName?: string
  ): Promise<LeaveRequest | null> {
    const updated = multiTenantStore.reviewLeaveRequest(organizationId, leaveId, status, notes, reviewerName);
    return updated || null;
  }

  // ================= MENTORSHIP & PROGRESS REVIEWS =================

  public async getMentorshipReviews(organizationId: string, internId?: string): Promise<MentorshipReview[]> {
    return multiTenantStore.getMentorshipReviews(organizationId, internId);
  }

  public async submitMentorshipReview(
    data: Omit<MentorshipReview, "id" | "created_at">
  ): Promise<MentorshipReview> {
    return multiTenantStore.submitMentorshipReview(data);
  }

  // ================= TASK COLLABORATION =================

  public async addTaskComment(
    organizationId: string,
    taskId: string,
    authorName: string,
    text: string
  ): Promise<Task | null> {
    const updated = multiTenantStore.addTaskComment(organizationId, taskId, authorName, text);
    return updated || null;
  }

  // ================= MEMBER STATUS =================

  public async toggleMembershipStatus(id: string): Promise<OrganizationMembership | null> {
    const updated = multiTenantStore.toggleMembershipStatus(id);
    return updated || null;
  }

  // ================= SUPER ADMIN METRICS & AUDIT LOGS =================

  public async getSuperAdminMetrics() {
    return multiTenantStore.getSuperAdminMetrics();
  }

  public async getAuditLogs(organizationId?: string): Promise<AuditLog[]> {
    return multiTenantStore.getAuditLogs(organizationId);
  }
}

// Singleton Database Service
export const dbService = new MultiTenantDatabaseService();

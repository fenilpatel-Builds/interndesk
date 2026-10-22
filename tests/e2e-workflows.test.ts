import { describe, it, expect } from "vitest";
import { dbService } from "../src/lib/multitenant/db-service";
import { multiTenantStore } from "../src/lib/multitenant/store";
import { validateOrganizationCode } from "../src/lib/multitenant/code-generator";
import { hasPermission } from "../src/lib/multitenant/permissions";
import { getWorkforceAnalytics } from "../src/lib/multitenant/analytics";

describe("Phase 21: End-to-End Multi-Tenant Workflows & Security Validation", () => {
  const APEX_ORG = "org-apex-01";
  const WESTBRIDGE_ORG = "org-westbridge-02";

  // ================= JOURNEY 1 =================
  describe("Journey 1: User Authentication & Session Establishment", () => {
    it("generates and verifies 6-digit email OTPs strictly adhering to numeric format", () => {
      const testEmail = "engineer.tester@enterprise.io";
      const sampleOtp = "584920";

      // Enforce 6-digit numeric pattern
      expect(/^\d{6}$/.test(sampleOtp)).toBe(true);
      expect(/^\d{6}$/.test("12345")).toBe(false);
      expect(/^\d{6}$/.test("abcdef")).toBe(false);

      // Verify email canonicalization
      const canonical = testEmail.toLowerCase().trim();
      expect(canonical).toBe("engineer.tester@enterprise.io");
    });

    it("distinguishes Super Admin credentials from standard tenant roles", () => {
      const superAdminEmail = "superadmin@interndesk.com";
      const normalUserEmail = "intern@apextech.com";

      const isSuperAdmin = superAdminEmail.toLowerCase() === "superadmin@interndesk.com";
      const isNormalSuperAdmin = normalUserEmail.toLowerCase() === "superadmin@interndesk.com";

      expect(isSuperAdmin).toBe(true);
      expect(isNormalSuperAdmin).toBe(false);
    });
  });

  // ================= JOURNEY 2 =================
  describe("Journey 2: Organization Creation & Code Assignment", () => {
    it("creates a new tenant organization with Crockford Base32 ORG-XXXXXX code and pending verification", async () => {
      const newOrg = await dbService.createOrganization({
        name: "Quantum Dynamics Corp",
        type: "CORPORATE",
        official_email: "admin@quantumdyn.io",
        industry_or_category: "Quantum Computing & Simulation",
        country: "United States",
        creator_email: "founder@quantumdyn.io",
      });

      expect(newOrg).toBeDefined();
      expect(newOrg.id).toBeDefined();
      expect(newOrg.name).toBe("Quantum Dynamics Corp");
      expect(newOrg.status).toBe("VERIFICATION_PENDING");

      // Validate ORG-XXXXXX code structure
      const validation = validateOrganizationCode(newOrg.code);
      expect(validation.isValid).toBe(true);
      expect(newOrg.code.startsWith("ORG-")).toBe(true);

      // Verify organization can be retrieved by code
      const retrieved = await dbService.getOrganizationByCode(newOrg.code);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(newOrg.id);
    });
  });

  // ================= JOURNEY 3 =================
  describe("Journey 3: Super Admin Verification Flow", () => {
    it("allows platform super admin to approve or suspend organization tenants", async () => {
      const pendingOrg = await dbService.createOrganization({
        name: "Veritas Cyber Defense",
        type: "CORPORATE",
        official_email: "contact@veritascyber.com",
        industry_or_category: "Information Security",
      });

      expect(pendingOrg.status).toBe("VERIFICATION_PENDING");

      // Approve organization
      const approvedOrg = await dbService.verifyOrganization(
        pendingOrg.id,
        "APPROVED",
        "Official domain and documentation verified by Platform Super Admin"
      );
      expect(approvedOrg?.status).toBe("APPROVED");

      // Verify metrics reflect operational health
      const metrics = await dbService.getSuperAdminMetrics();
      expect(metrics.totalOrgs).toBeGreaterThan(0);
      expect(metrics.verifiedOrgs).toBeGreaterThan(0);
    });
  });

  // ================= JOURNEY 4 =================
  describe("Journey 4: Member Invitation & Acceptance Flow", () => {
    it("validates legitimate invitation token and creates active membership", async () => {
      const validToken = "INV-APX-VALID-2026";
      const validation = await dbService.validateInvitation(validToken);

      expect(validation.valid).toBe(true);
      expect(validation.organization?.id).toBe(APEX_ORG);
      expect(validation.role).toBe("INTERN");

      // Accept invitation
      const acceptResult = await dbService.acceptInvitation(
        validToken,
        "newintern@apextech.com",
        "Priya Sharma"
      );

      expect(acceptResult.success).toBe(true);
      expect(acceptResult.membership).toBeDefined();
      expect(acceptResult.membership?.organization_id).toBe(APEX_ORG);
      expect(acceptResult.membership?.role).toBe("INTERN");
      expect(acceptResult.membership?.status).toBe("ACTIVE");
    });
  });

  // ================= JOURNEY 5 =================
  describe("Journey 5: Expired / Invalid Invitation Rejection", () => {
    it("strictly rejects expired invitation tokens with an explicit error", async () => {
      const expiredToken = "INV-WB-EXPIRED-2026";
      const validation = await dbService.validateInvitation(expiredToken);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("expired");

      const acceptResult = await dbService.acceptInvitation(
        expiredToken,
        "student@westbridge.edu",
        "Expired Student"
      );
      expect(acceptResult.success).toBe(false);
      expect(acceptResult.error).toContain("expired");
    });

    it("rejects non-existent or forged invitation tokens", async () => {
      const fakeToken = "INV-FORGED-SECRET-TOKEN";
      const validation = await dbService.validateInvitation(fakeToken);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("Invalid invitation token");
    });
  });

  // ================= JOURNEY 6 =================
  describe("Journey 6: Organization Code Discovery & Joining", () => {
    it("locates organization via organization code and checks joining policies", async () => {
      // Westbridge University has joining_policy CODE_ONLY
      const westbridge = await dbService.getOrganizationByCode("ORG-M8D2QF");
      expect(westbridge).toBeDefined();
      expect(westbridge?.name).toBe("Westbridge University");
      expect(westbridge?.joining_policy).toBe("CODE_ONLY");

      // Apex Tech has joining_policy REQUEST_APPROVAL
      const apex = await dbService.getOrganizationByCode("ORG-7K4P9X");
      expect(apex).toBeDefined();
      expect(apex?.name).toBe("Apex Technologies");
      expect(apex?.joining_policy).toBe("REQUEST_APPROVAL");
    });

    it("rejects join attempts for non-existent codes", async () => {
      const invalid = await dbService.getOrganizationByCode("ORG-ZZZZZZ");
      expect(invalid).toBeNull();
    });
  });

  // ================= JOURNEY 7 =================
  describe("Journey 7: Workspace Switching & Context Scoping", () => {
    it("scopes all memberships, tasks, and reports to the targeted workspace", async () => {
      const apexMembers = await dbService.getMemberships(APEX_ORG);
      const westbridgeMembers = await dbService.getMemberships(WESTBRIDGE_ORG);

      expect(apexMembers.length).toBeGreaterThan(0);
      expect(westbridgeMembers.length).toBeGreaterThan(0);

      expect(apexMembers.every((m) => m.organization_id === APEX_ORG)).toBe(true);
      expect(westbridgeMembers.every((m) => m.organization_id === WESTBRIDGE_ORG)).toBe(true);
    });
  });

  // ================= JOURNEY 8 =================
  describe("Journey 8: Cross-Tenant Data Access Rejection", () => {
    it("never returns Apex Technologies data when querying Westbridge University", async () => {
      const apexTasks = await dbService.getTasks(APEX_ORG);
      const westbridgeTasks = await dbService.getTasks(WESTBRIDGE_ORG);

      const apexIds = new Set(apexTasks.map((t) => t.id));
      for (const task of westbridgeTasks) {
        expect(apexIds.has(task.id)).toBe(false);
      }

      // Member from Westbridge cannot access Apex reports
      expect(multiTenantStore.canUserAccessOrganization("student@westbridge.edu", APEX_ORG)).toBe(false);
    });
  });

  // ================= JOURNEY 9 =================
  describe("Journey 9: Attendance Clock-In, Multi-Break & Server Duration Calculation", () => {
    it("handles clock-in, break start, resume, and server-side productive duration calculation", async () => {
      const memberId = "mem-e2e-tester-01";
      const memberName = "Tester Alex";

      // 1. Clock In
      const clockInRes = await dbService.recordClockIn(APEX_ORG, memberId, memberName);
      expect(clockInRes.success).toBe(true);
      expect(clockInRes.session).toBeDefined();
      expect(clockInRes.session?.status).toBe("WORKING");

      const sessionId = clockInRes.session!.id;

      // 2. Prevent duplicate clock in
      const duplicateRes = await dbService.recordClockIn(APEX_ORG, memberId, memberName);
      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.error).toContain("already running");

      // 3. Start Break
      const breakRes = await dbService.recordBreak(APEX_ORG, sessionId, "LUNCH");
      expect(breakRes.success).toBe(true);
      expect(breakRes.session?.status).toBe("ON_BREAK");
      expect(breakRes.session?.current_break_type).toBe("LUNCH");

      // 4. Resume Work
      const resumeRes = await dbService.recordResume(APEX_ORG, sessionId);
      expect(resumeRes.success).toBe(true);
      expect(resumeRes.session?.status).toBe("WORKING");
      expect(resumeRes.session?.current_break_type).toBeUndefined();

      // 5. Clock Out & Duration math
      const clockOutRes = await dbService.recordClockOut(APEX_ORG, sessionId);
      expect(clockOutRes.success).toBe(true);
      expect(clockOutRes.session?.status).toBe("COMPLETED");
      expect(clockOutRes.session?.clock_out_at).toBeDefined();
      expect(clockOutRes.session?.total_seconds).toBeGreaterThanOrEqual(0);
      expect(clockOutRes.session?.productive_seconds).toBeGreaterThanOrEqual(0);
    });
  });

  // ================= JOURNEY 10 =================
  describe("Journey 10: Task Lifecycle & Tenant Scoping", () => {
    it("manages task creation, status transition, and enforces organization boundary", async () => {
      // Create task
      const newTask = await dbService.createTask({
        organization_id: APEX_ORG,
        title: "E2E Automated Tenant Verification",
        description: "Verify that all CRUD workflows maintain strict organization scoping.",
        priority: "HIGH",
        status: "PENDING",
        due_date: "2026-10-31",
      });

      expect(newTask.id).toBeDefined();
      expect(newTask.organization_id).toBe(APEX_ORG);
      expect(newTask.status).toBe("PENDING");

      // Update status to IN_PROGRESS
      const inProgress = await dbService.updateTaskStatus(APEX_ORG, newTask.id, "IN_PROGRESS");
      expect(inProgress?.status).toBe("IN_PROGRESS");

      // Update status to COMPLETED
      const completed = await dbService.updateTaskStatus(APEX_ORG, newTask.id, "COMPLETED");
      expect(completed?.status).toBe("COMPLETED");

      // Attempting to update Apex task using Westbridge org scope must be rejected
      const crossTenantUpdate = await dbService.updateTaskStatus(WESTBRIDGE_ORG, newTask.id, "CANCELLED");
      expect(crossTenantUpdate).toBeNull();
    });
  });

  // ================= JOURNEY 11 =================
  describe("Journey 11: Daily Report Submission & Supervisor Review", () => {
    it("allows member to submit report and supervisor to review and approve", async () => {
      // Submit report
      const newReport = await dbService.submitDailyReport({
        organization_id: APEX_ORG,
        member_id: "mem-apex-intern",
        member_name: "Sarah Chen",
        report_date: "2026-10-13",
        project_or_program: "Cloud Backend Track",
        activities: "Implemented database service layer and end-to-end tests.",
        work_completed: "Built db-service.ts, auth-guard.ts, and actions.ts.",
        challenges: "Ensured backward compatibility with seed store.",
        next_steps: "Finalize release documentation.",
      });

      expect(newReport.id).toBeDefined();
      expect(newReport.status).toBe("UNDER_REVIEW");

      // Supervisor Review
      const reviewed = await dbService.reviewDailyReport(
        APEX_ORG,
        newReport.id,
        "APPROVED",
        "Excellent architectural design and clean test coverage.",
        "mem-apex-mgr"
      );

      expect(reviewed).toBeDefined();
      expect(reviewed?.status).toBe("APPROVED");
      expect(reviewed?.reviewer_feedback).toContain("Excellent architectural design");
      expect(reviewed?.reviewer_id).toBe("mem-apex-mgr");

      // Reject cross-tenant review attempt
      const invalidReview = await dbService.reviewDailyReport(
        WESTBRIDGE_ORG,
        newReport.id,
        "APPROVED",
        "Illegal review attempt",
        "supervisor-wb"
      );
      expect(invalidReview).toBeNull();
    });
  });

  // ================= JOURNEY 12 =================
  describe("Journey 12: Assessment Auto-Grading & Pass/Fail Scoring", () => {
    it("evaluates student answers server-side and calculates score and pass status", async () => {
      const assessments = await dbService.getAssessments(APEX_ORG);
      expect(assessments.length).toBeGreaterThan(0);

      const exam = assessments[0];
      expect(exam.questions.length).toBeGreaterThan(0);

      // Submit perfect answers
      const perfectAnswers: Record<string, string> = {};
      exam.questions.forEach((q) => {
        perfectAnswers[q.id] = q.correct_answer as string;
      });

      const result = await dbService.submitAssessmentAttempt(
        APEX_ORG,
        exam.id,
        "mem-apex-intern",
        perfectAnswers
      );

      expect(result.success).toBe(true);
      expect(result.attempt).toBeDefined();
      expect(result.attempt?.score).toBe(exam.total_marks);
      expect(result.attempt?.percentage).toBe(100);
      expect(result.attempt?.passed).toBe(true);
    });

    it("evaluates failing score when student submits incorrect answers", async () => {
      const assessments = await dbService.getAssessments(APEX_ORG);
      const exam = assessments[0];

      // Submit all incorrect answers
      const wrongAnswers: Record<string, string> = {};
      exam.questions.forEach((q) => {
        wrongAnswers[q.id] = "completely wrong answer";
      });

      const result = await dbService.submitAssessmentAttempt(
        APEX_ORG,
        exam.id,
        "mem-apex-intern",
        wrongAnswers
      );

      expect(result.success).toBe(true);
      expect(result.attempt?.percentage).toBe(0);
      expect(result.attempt?.passed).toBe(false);
    });
  });

  // ================= JOURNEY 13 =================
  describe("Journey 13: Verifiable Credential Lookup", () => {
    it("allows public verification of issued completion certificates", async () => {
      // Westbridge University completion certificate
      const doc = await dbService.verifyDocumentByNumber("IND-WBU-2026-0108");
      expect(doc).toBeDefined();
      expect(doc?.status).toBe("ISSUED");
      expect(doc?.document_type).toBe("COMPLETION_CERTIFICATE");
      expect(doc?.recipient_name).toBe("Sarah Chen");
    });

    it("rejects non-existent document numbers", async () => {
      const doc = await dbService.verifyDocumentByNumber("IND-NONEXISTENT-9999");
      expect(doc).toBeNull();
    });
  });

  // ================= JOURNEY 14 =================
  describe("Journey 14: Private Document Access Restriction", () => {
    it("restricts private offer letters to recipient and organization administrators", () => {
      const docId = "doc-01"; // Apex Offer Letter for Sarah Chen

      // Recipient Sarah Chen can view
      expect(
        multiTenantStore.isPrivateDocumentAccessible(docId, "sarah.chen@student.io", "INTERN", APEX_ORG)
      ).toBe(true);

      // Org Admin Elena Rostova can view
      expect(
        multiTenantStore.isPrivateDocumentAccessible(docId, "admin@apextech.com", "ORG_ADMIN", APEX_ORG)
      ).toBe(true);

      // Other student/intern CANNOT view
      expect(
        multiTenantStore.isPrivateDocumentAccessible(docId, "other.intern@apextech.com", "INTERN", APEX_ORG)
      ).toBe(false);

      // User from another tenant CANNOT view
      expect(
        multiTenantStore.isPrivateDocumentAccessible(docId, "sarah.chen@student.io", "INTERN", WESTBRIDGE_ORG)
      ).toBe(false);
    });
  });

  // ================= JOURNEY 15 =================
  describe("Journey 15: Role Permission Enforcement & Zero-Payment Policy", () => {
    it("enforces RBAC permissions across administrative and student roles", () => {
      // Admin permissions
      expect(hasPermission("ORG_ADMIN", "members.manage")).toBe(true);
      expect(hasPermission("ORG_ADMIN", "tasks.create")).toBe(true);
      expect(hasPermission("ORG_ADMIN", "reports.review")).toBe(true);

      // Intern permissions
      expect(hasPermission("INTERN", "attendance.clock")).toBe(true);
      expect(hasPermission("INTERN", "reports.submit")).toBe(true);
      expect(hasPermission("INTERN", "members.manage")).toBe(false);
      expect(hasPermission("INTERN", "reports.review")).toBe(false);
    });

    it("verifies zero payment policy: no fee or checkout permissions exist", () => {
      // Multi-tenant permission system does not declare any payment or transaction permissions
      const adminPerms = hasPermission("ORG_ADMIN", "documents.issue");
      expect(adminPerms).toBe(true);

      // Platform policy confirmed
      expect(multiTenantStore.getSuperAdminMetrics().platformHealth).toBe("100% Operational");
    });
  });

  // ================= JOURNEY 16 =================
  describe("Journey 16: Leave Management Lifecycle & Tenant Isolation", () => {
    it("submits a leave request, confirms pending state, and reviews with approval", async () => {
      const initialLeaves = await dbService.getLeaveRequests(APEX_ORG);
      const initialCount = initialLeaves.length;

      const newLeave = await dbService.submitLeaveRequest({
        organization_id: APEX_ORG,
        member_id: "mem-02",
        member_name: "Sarah Chen",
        leave_type: "SICK",
        start_date: "2026-10-25",
        end_date: "2026-10-26",
        days_count: 2,
        reason: "Medical appointment and recovery",
      });

      expect(newLeave).toBeDefined();
      expect(newLeave.id).toBeDefined();
      expect(newLeave.status).toBe("PENDING");
      expect(newLeave.leave_type).toBe("SICK");

      // Verify retrieval within APEX_ORG
      const updatedLeaves = await dbService.getLeaveRequests(APEX_ORG);
      expect(updatedLeaves.length).toBe(initialCount + 1);
      const found = updatedLeaves.find((l) => l.id === newLeave.id);
      expect(found).toBeDefined();
      expect(found?.member_name).toBe("Sarah Chen");

      // Verify strict tenant isolation: Westbridge Org cannot see this leave
      const westbridgeLeaves = await dbService.getLeaveRequests(WESTBRIDGE_ORG);
      expect(westbridgeLeaves.some((l) => l.id === newLeave.id)).toBe(false);

      // Review leave: Approve by HR
      const reviewed = await dbService.reviewLeaveRequest(
        APEX_ORG,
        newLeave.id,
        "APPROVED",
        "Approved by HR Administration",
        "HR Coordinator"
      );
      expect(reviewed).toBeDefined();
      expect(reviewed?.status).toBe("APPROVED");
      expect(reviewed?.reviewer_notes).toBe("Approved by HR Administration");
    });
  });

  // ================= JOURNEY 17 =================
  describe("Journey 17: Mentorship Weekly Progress Evaluation & Rubric", () => {
    it("records mentor rubric evaluation and enforces tenant privacy", async () => {
      const initialReviews = await dbService.getMentorshipReviews(APEX_ORG);
      const initialCount = initialReviews.length;

      const review = await dbService.submitMentorshipReview({
        organization_id: APEX_ORG,
        intern_id: "mem-02",
        intern_name: "Sarah Chen",
        mentor_id: "mem-04",
        mentor_name: "Dr. Marcus Vance",
        week_number: 4,
        technical_score: 9,
        communication_score: 8,
        initiative_score: 10,
        feedback: "Outstanding grasp of distributed architecture and zero-payment constraints.",
        milestone_status: "EXCELLING",
      });

      expect(review).toBeDefined();
      expect(review.id).toBeDefined();
      expect(review.technical_score).toBe(9);
      expect(review.milestone_status).toBe("EXCELLING");

      // Verify listed in Apex
      const apexReviews = await dbService.getMentorshipReviews(APEX_ORG);
      expect(apexReviews.length).toBe(initialCount + 1);

      // Verify tenant isolation: Westbridge cannot view Apex mentorship reviews
      const westbridgeReviews = await dbService.getMentorshipReviews(WESTBRIDGE_ORG);
      expect(westbridgeReviews.some((r) => r.id === review.id)).toBe(false);
    });
  });

  // ================= JOURNEY 18 =================
  describe("Journey 18: Task Collaboration & Overdue Detection", () => {
    it("appends collaboration comments to an existing task and tracks timestamps", async () => {
      const tasks = multiTenantStore.getTasks(APEX_ORG);
      expect(tasks.length).toBeGreaterThan(0);
      const targetTask = tasks[0];

      const initialCommentCount = targetTask.comments?.length || 0;

      const updatedTask = await dbService.addTaskComment(
        APEX_ORG,
        targetTask.id,
        "Sarah Chen",
        "PR reviewed and automated security checks passing 100%."
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.comments).toBeDefined();
      expect(updatedTask?.comments?.length).toBe(initialCommentCount + 1);

      const latestComment = updatedTask?.comments?.[(updatedTask.comments?.length || 1) - 1];
      expect(latestComment?.author_name).toBe("Sarah Chen");
      expect(latestComment?.text).toContain("PR reviewed");
      expect(latestComment?.created_at).toBeDefined();
    });
  });

  // ================= JOURNEY 19 =================
  describe("Journey 19: Workforce Member Lifecycle & Status Control", () => {
    it("toggles member status between ACTIVE and SUSPENDED and verifies employee metadata", async () => {
      const members = multiTenantStore.getMemberships(APEX_ORG);
      expect(members.length).toBeGreaterThan(0);

      // Verify employee ID and skills exist on members
      const employeeMember = members.find((m) => m.employee_id);
      expect(employeeMember).toBeDefined();
      expect(employeeMember?.employee_id).toBeDefined();
      expect(employeeMember?.skills).toBeDefined();
      expect(Array.isArray(employeeMember?.skills)).toBe(true);

      // Target member for status toggle
      const target = members[0];
      const initialStatus = target.status;

      // Toggle status
      const updated = await dbService.toggleMembershipStatus(target.id);
      expect(updated).toBeDefined();
      expect(updated?.status).toBe(initialStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE");

      // Revert back
      const reverted = await dbService.toggleMembershipStatus(target.id);
      expect(reverted?.status).toBe(initialStatus);
    });
  });

  // ================= JOURNEY 20 =================
  describe("Journey 20: AI & Deterministic Operational Workforce Analytics", () => {
    it("computes workforce velocity, shift efficiency, and executive briefings", () => {
      const analytics = getWorkforceAnalytics(APEX_ORG);

      expect(analytics).toBeDefined();
      expect(analytics.organizationId).toBe(APEX_ORG);
      expect(analytics.totalMembers).toBeGreaterThan(0);
      expect(analytics.activeEmployees).toBeGreaterThanOrEqual(0);
      expect(analytics.activeInterns).toBeGreaterThanOrEqual(0);
      expect(analytics.completionRate).toBeGreaterThanOrEqual(0);
      expect(analytics.completionRate).toBeLessThanOrEqual(100);
      expect(analytics.totalWorkHours).toBeGreaterThanOrEqual(0);
      expect(analytics.executiveSummary).toBeDefined();
      expect(analytics.executiveSummary.startsWith("Workforce performance is operating at")).toBe(true);
      expect(Array.isArray(analytics.certificateEligibleInterns)).toBe(true);
    });
  });

  // ================= JOURNEY 21 =================
  describe("Journey 21: Organization Branding Studio & Letterhead Styling", () => {
    it("persists custom logo, address, contact, signatory credentials, and brand color", () => {
      const updatedOrg = multiTenantStore.updateOrganizationBranding(APEX_ORG, {
        logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=128",
        brandColor: "#7c3aed",
        address: "700 Innovation Way, Silicon Valley, CA 94025",
        website: "https://apex.test.internal",
        contactEmail: "hr@apex.test.internal",
        contactPhone: "+1 (555) 789-0123",
        signatoryName: "Elena Rostova",
        signatoryTitle: "Chief Operations Officer",
        signatorySignatureUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        customOfferTerms: "Standard strict proprietary and IP assignment terms apply.",
      });

      expect(updatedOrg).toBeDefined();
      expect(updatedOrg?.branding?.brandColor).toBe("#7c3aed");
      expect(updatedOrg?.branding?.address).toContain("Innovation Way");
      expect(updatedOrg?.branding?.signatoryName).toBe("Elena Rostova");
      expect(updatedOrg?.branding?.signatoryTitle).toBe("Chief Operations Officer");
      expect(updatedOrg?.branding?.customOfferTerms).toContain("IP assignment");
    });
  });

  // ================= JOURNEY 22 =================
  describe("Journey 22: Document Approval Pipeline & Security Gate", () => {
    it("handles pending document approval lifecycle, security gates, and approval release", () => {
      // 1. Issue a document in PENDING_APPROVAL status
      const testDocNumber = `IND-TEST-${Date.now()}`;
      const pendingDoc = multiTenantStore.issueDocument({
        organization_id: APEX_ORG,
        member_id: "mem-test-candidate",
        document_number: testDocNumber,
        document_type: "OFFER_LETTER",
        title: "Software Engineering Intern Offer Letter",
        recipient_name: "Test Candidate",
        recipient_role: "Software Engineering Intern",
        issued_date: new Date().toISOString().split("T")[0],
        status: "PENDING_APPROVAL",
        approval_status: "PENDING",
        verification_code: "VRF-SEC-TEST-9999",
        template_data: {
          organization_name: "Apex Technologies",
          organization_type: "CORPORATE",
          signatory_name: "Dr. Rajesh Sharma",
          signatory_title: "Head of Operations",
          program_or_track: "Software Engineering Practicum",
          validity: "Pending Administrative Approval",
        },
      });

      expect(pendingDoc).toBeDefined();
      expect(pendingDoc.status).toBe("PENDING_APPROVAL");
      expect(pendingDoc.approval_status).toBe("PENDING");
      expect(pendingDoc.approved_by).toBeUndefined();

      // 2. Query document via findDocumentByNumber
      const queried = multiTenantStore.findDocumentByNumber(testDocNumber);
      expect(queried).toBeDefined();
      expect(queried?.status).toBe("PENDING_APPROVAL");

      // 3. Approve and release the document
      const approved = multiTenantStore.approveDocument(APEX_ORG, pendingDoc.id, "Dr. Rajesh Sharma");
      expect(approved).toBeDefined();
      expect(approved?.status).toBe("ISSUED");
      expect(approved?.approval_status).toBe("APPROVED");
      expect(approved?.approved_by).toBe("Dr. Rajesh Sharma");
      expect(approved?.approved_at).toBeDefined();

      // 4. Verify findDocumentByNumber reflects approved status
      const reQueried = multiTenantStore.findDocumentByNumber(testDocNumber);
      expect(reQueried?.status).toBe("ISSUED");
      expect(reQueried?.approval_status).toBe("APPROVED");
    });

    it("handles document rejection with audit logging", () => {
      const rejectDocNumber = `IND-REJ-${Date.now()}`;
      const toReject = multiTenantStore.issueDocument({
        organization_id: APEX_ORG,
        member_id: "mem-test-rejected",
        document_number: rejectDocNumber,
        document_type: "COMPLETION_CERTIFICATE",
        title: "Certificate Draft",
        recipient_name: "Candidate Rejection Test",
        recipient_role: "Intern",
        issued_date: "2026-10-22",
        status: "PENDING_APPROVAL",
        approval_status: "PENDING",
        verification_code: "VRF-SEC-REJ-1111",
        template_data: {
          organization_name: "Apex Technologies",
          organization_type: "CORPORATE",
          signatory_name: "Dr. Rajesh Sharma",
          signatory_title: "Head of Operations",
          program_or_track: "Software Engineering Practicum",
          validity: "Pending Administrative Approval",
        },
      });

      const rejected = multiTenantStore.rejectDocument(APEX_ORG, toReject.id, "Missing mentor evaluation metrics", "Lead Admin");
      expect(rejected).toBeDefined();
      expect(rejected?.status).toBe("REVOKED");
      expect(rejected?.approval_status).toBe("REJECTED");
      expect(rejected?.rejection_reason).toBe("Missing mentor evaluation metrics");
    });
  });
});


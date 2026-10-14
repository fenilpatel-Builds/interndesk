"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  FolderTree,
  Sparkles,
  CheckSquare,
  Clock,
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Square,
  ExternalLink,
  Download,
  RefreshCw,
  GraduationCap,
  MessageSquare,
  UserPlus,
  Power,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { GlobalSearchModal } from "@/components/workspace/global-search-modal";
import { multiTenantStore } from "@/lib/multitenant/store";
import {
  Organization,
  OrganizationMembership,
  MemberRole,
  MemberType,
  Task,
  TaskStatus,
  WorkSession,
  DailyReport,
  LearningMaterial,
  Assessment,
  IssuedDocument,
  Announcement,
  Department,
  Team,
  Program,
  BreakType,
  LeaveRequest,
  LeaveType,
  MentorshipReview,
} from "@/types/multitenant";
import { hasPermission, getRoleDisplayName } from "@/lib/multitenant/permissions";
import { getWorkforceAnalytics } from "@/lib/multitenant/analytics";

export default function WorkspacePage() {
  const [organizations, setOrganizations] = useState<Organization[]>(multiTenantStore.getOrganizations());
  const [activeOrg, setActiveOrg] = useState<Organization>(organizations[0]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Active User Persona
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: MemberRole;
  }>({
    name: "Elena Rostova",
    email: "admin@apextech.com",
    role: "ORG_ADMIN",
  });

  // Core Data States
  const [members, setMembers] = useState<OrganizationMembership[]>(() => multiTenantStore.getMemberships(organizations[0]?.id || ""));
  const [tasks, setTasks] = useState<Task[]>(() => multiTenantStore.getTasks(organizations[0]?.id || ""));
  const [workSessions, setWorkSessions] = useState<WorkSession[]>(() => multiTenantStore.getWorkSessions(organizations[0]?.id || ""));
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => multiTenantStore.getDailyReports(organizations[0]?.id || ""));
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>(() => multiTenantStore.getLearningMaterials(organizations[0]?.id || ""));
  const [assessments, setAssessments] = useState<Assessment[]>(() => multiTenantStore.getAssessments(organizations[0]?.id || ""));
  const [documents, setDocuments] = useState<IssuedDocument[]>(() => multiTenantStore.getIssuedDocuments(organizations[0]?.id || ""));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => multiTenantStore.getAnnouncements(organizations[0]?.id || ""));
  const [departments, setDepartments] = useState<Department[]>(() => multiTenantStore.getDepartments(organizations[0]?.id || ""));
  const [teams, setTeams] = useState<Team[]>(() => multiTenantStore.getTeams(organizations[0]?.id || ""));
  const [programs, setPrograms] = useState<Program[]>(() => multiTenantStore.getPrograms(organizations[0]?.id || ""));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => multiTenantStore.getLeaveRequests(organizations[0]?.id || ""));
  const [mentorshipReviews, setMentorshipReviews] = useState<MentorshipReview[]>(() => multiTenantStore.getMentorshipReviews(organizations[0]?.id || ""));

  // Modals & Runners
  const [selectedMember, setSelectedMember] = useState<OrganizationMembership | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<IssuedDocument | null>(null);
  const [examRunnerAssessment, setExamRunnerAssessment] = useState<Assessment | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<{ score: number; percentage: number; passed: boolean } | null>(null);

  // Member Management Filters & Modal
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("ALL");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>("EMPLOYEE");
  const [newMemberType, setNewMemberType] = useState<MemberType>("EMPLOYEE");
  const [newMemberDesignation, setNewMemberDesignation] = useState("");
  const [newMemberSkills, setNewMemberSkills] = useState("");

  // Task Creation & Collaboration Filters & Modals
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("ALL");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newTaskDueDate] = useState("2026-10-24");
  const [selectedTaskComments, setSelectedTaskComments] = useState<Task | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Leave Request Modal
  const [isNewLeaveOpen, setIsNewLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("CASUAL");
  const [leaveStartDate, setLeaveStartDate] = useState("2026-10-20");
  const [leaveEndDate, setLeaveEndDate] = useState("2026-10-21");
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState("");

  // Mentorship Review Modal
  const [isNewMentorReviewOpen, setIsNewMentorReviewOpen] = useState(false);
  const [reviewInternId, setReviewInternId] = useState("mem-apex-intern");
  const [reviewTechScore, setReviewTechScore] = useState(9);
  const [reviewCommScore, setReviewCommScore] = useState(9);
  const [reviewInitScore, setReviewInitScore] = useState(10);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewMilestone, setReviewMilestone] = useState<"ON_TRACK" | "EXCELLING" | "NEEDS_SUPPORT">("EXCELLING");

  // Daily Report Modal
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [reportActivities, setReportActivities] = useState("");
  const [reportCompleted, setReportCompleted] = useState("");
  const [reportBlockers, setReportBlockers] = useState("");

  // Program Modal
  const [isNewProgramOpen, setIsNewProgramOpen] = useState(false);
  const [newProgName, setNewProgName] = useState("");
  const [newProgTech, setNewProgTech] = useState("");
  const [newProgDuration] = useState("3 Months");

  // Live Timer State for Attendance
  const [timerSeconds, setTimerSeconds] = useState(14400); // 4 hours demo
  const [activeSession, setActiveSession] = useState<WorkSession | null>(() => {
    const initOrgId = organizations[0]?.id || "";
    const initMems = multiTenantStore.getMemberships(initOrgId);
    return multiTenantStore.getActiveWorkSession(initOrgId, initMems[0]?.id || "mem-apex-intern") || null;
  });

  // Deterministic Analytics Computation
  const insights = useMemo(() => {
    void members.length;
    void tasks.length;
    void workSessions.length;
    return getWorkforceAnalytics(activeOrg.id);
  }, [activeOrg.id, members, tasks, workSessions]);

  // Load tenant-isolated data
  const reloadTenantData = (orgId: string = activeOrg.id) => {
    setOrganizations(multiTenantStore.getOrganizations());
    setMembers(multiTenantStore.getMemberships(orgId));
    setTasks(multiTenantStore.getTasks(orgId));
    setWorkSessions(multiTenantStore.getWorkSessions(orgId));
    setDailyReports(multiTenantStore.getDailyReports(orgId));
    setLearningMaterials(multiTenantStore.getLearningMaterials(orgId));
    setAssessments(multiTenantStore.getAssessments(orgId));
    setDocuments(multiTenantStore.getIssuedDocuments(orgId));
    setAnnouncements(multiTenantStore.getAnnouncements(orgId));
    setDepartments(multiTenantStore.getDepartments(orgId));
    setTeams(multiTenantStore.getTeams(orgId));
    setPrograms(multiTenantStore.getPrograms(orgId));
    setLeaveRequests(multiTenantStore.getLeaveRequests(orgId));
    setMentorshipReviews(multiTenantStore.getMentorshipReviews(orgId));

    const currentMemberId = multiTenantStore.getMemberships(orgId)[0]?.id || "mem-apex-intern";
    const act = multiTenantStore.getActiveWorkSession(orgId, currentMemberId);
    setActiveSession(act || null);
  };

  const handleSelectOrg = (org: Organization) => {
    setActiveOrg(org);
    reloadTenantData(org.id);
  };

  // Live Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && activeSession.status === "WORKING") {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Attendance Handlers
  const handleClockIn = () => {
    const memberId = members[0]?.id || "mem-apex-intern";
    const sess = multiTenantStore.clockIn(activeOrg.id, memberId, currentUser.name);
    setActiveSession(sess);
    setTimerSeconds(0);
    reloadTenantData();
  };

  const handleStartBreak = (breakType: BreakType) => {
    if (!activeSession) return;
    const sess = multiTenantStore.startBreak(activeOrg.id, activeSession.id, breakType);
    if (sess) setActiveSession(sess);
    reloadTenantData();
  };

  const handleResumeBreak = () => {
    if (!activeSession) return;
    const sess = multiTenantStore.resumeBreak(activeOrg.id, activeSession.id);
    if (sess) setActiveSession(sess);
    reloadTenantData();
  };

  const handleClockOut = () => {
    if (!activeSession) return;
    multiTenantStore.clockOut(activeOrg.id, activeSession.id);
    setActiveSession(null);
    reloadTenantData();
  };

  // Task Handlers
  const handleCreateTask = () => {
    if (!newTaskTitle) return;
    multiTenantStore.createTask({
      organization_id: activeOrg.id,
      title: newTaskTitle,
      description: "Assigned via enterprise task orchestrator.",
      assignee_name: newTaskAssignee || currentUser.name,
      priority: newTaskPriority,
      status: "PENDING",
      due_date: newTaskDueDate,
    });
    setNewTaskTitle("");
    setIsNewTaskOpen(false);
    reloadTenantData();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    multiTenantStore.updateTaskStatus(activeOrg.id, taskId, newStatus);
    reloadTenantData();
  };

  const handleAddComment = (taskId: string) => {
    if (!newCommentText.trim()) return;
    const updated = multiTenantStore.addTaskComment(activeOrg.id, taskId, currentUser.name, newCommentText.trim());
    setNewCommentText("");
    if (updated) {
      setSelectedTaskComments({ ...updated });
    }
    reloadTenantData();
  };

  // Report Handlers
  const handleSubmitReport = () => {
    if (!reportActivities) return;
    multiTenantStore.submitDailyReport({
      organization_id: activeOrg.id,
      member_id: members[0]?.id || "mem-apex-intern",
      member_name: currentUser.name,
      report_date: new Date().toISOString().split("T")[0],
      project_or_program: programs[0]?.name || "Core Track",
      activities: reportActivities,
      work_completed: reportCompleted || reportActivities,
      challenges: reportBlockers,
      next_steps: "Continue sprint tasks.",
    });
    setReportActivities("");
    setReportCompleted("");
    setReportBlockers("");
    setIsNewReportOpen(false);
    reloadTenantData();
  };

  // Leave Handlers
  const handleRequestLeave = () => {
    if (!leaveReason.trim()) return;
    multiTenantStore.submitLeaveRequest({
      organization_id: activeOrg.id,
      member_id: members[0]?.id || "mem-apex-intern",
      member_name: currentUser.name,
      leave_type: leaveType,
      start_date: leaveStartDate,
      end_date: leaveEndDate,
      days_count: leaveDays,
      reason: leaveReason,
    });
    setLeaveReason("");
    setIsNewLeaveOpen(false);
    reloadTenantData();
  };

  const handleReviewLeave = (leaveId: string, status: "APPROVED" | "REJECTED") => {
    multiTenantStore.reviewLeaveRequest(activeOrg.id, leaveId, status, `Reviewed by ${currentUser.name}`, currentUser.name);
    reloadTenantData();
  };

  // Mentorship Review Handlers
  const handleSubmitMentorReview = () => {
    if (!reviewFeedback.trim()) return;
    const intern = members.find((m) => m.id === reviewInternId) || members[2];
    multiTenantStore.submitMentorshipReview({
      organization_id: activeOrg.id,
      intern_id: intern?.id || "mem-apex-intern",
      intern_name: intern?.user_full_name || "Sarah Chen",
      mentor_id: members[1]?.id || "mem-apex-mgr",
      mentor_name: currentUser.name,
      week_number: mentorshipReviews.length + 1,
      technical_score: reviewTechScore,
      communication_score: reviewCommScore,
      initiative_score: reviewInitScore,
      feedback: reviewFeedback,
      milestone_status: reviewMilestone,
    });
    setReviewFeedback("");
    setIsNewMentorReviewOpen(false);
    reloadTenantData();
  };

  // Member Management Handlers
  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const skillsArray = newMemberSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const prefix = newMemberType === "EMPLOYEE" ? "EMP" : newMemberType === "INTERN" ? "INT" : "STU";
    const employeeId = `${prefix}-${activeOrg.name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    multiTenantStore.addMembership({
      organization_id: activeOrg.id,
      user_id: `usr-${Date.now()}`,
      employee_id: employeeId,
      user_full_name: newMemberName.trim(),
      user_email: newMemberEmail.trim(),
      role: newMemberRole,
      member_type: newMemberType,
      status: "ACTIVE",
      job_title: newMemberDesignation || newMemberType,
      designation: newMemberDesignation || newMemberType,
      manager_name: currentUser.name,
      skills: skillsArray.length > 0 ? skillsArray : ["General Engineering"],
      employment_status: newMemberType === "EMPLOYEE" ? "FULL_TIME" : "INTERN",
      joined_at: new Date().toISOString(),
    });

    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberDesignation("");
    setNewMemberSkills("");
    setIsAddMemberOpen(false);
    reloadTenantData();
  };

  const handleToggleMemberStatus = (memberId: string) => {
    multiTenantStore.toggleMembershipStatus(memberId);
    reloadTenantData();
  };

  // Assessment Runner Handlers
  const handleStartExam = (asm: Assessment) => {
    setExamRunnerAssessment(asm);
    setExamAnswers({});
    setExamResult(null);
  };

  const handleSubmitExam = () => {
    if (!examRunnerAssessment) return;
    const attempt = multiTenantStore.submitAssessmentAttempt(
      activeOrg.id,
      examRunnerAssessment.id,
      members[0]?.id || "mem-apex-intern",
      examAnswers
    );
    setExamResult({
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
    });
    reloadTenantData();
  };

  // Export CSV Handlers
  const handleExportMembersCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Employee ID,Name,Role,Member Type,Email,Designation,Status\n" +
      members.map((m) => `"${m.employee_id || "N/A"}","${m.user_full_name}","${m.role}","${m.member_type}","${m.user_email}","${m.designation || m.job_title || "N/A"}","${m.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeOrg.slug}-members-directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTasksCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Task ID,Title,Assignee,Priority,Status,Due Date\n" +
      tasks.map((t) => `"${t.id}","${t.title}","${t.assignee_name || "Unassigned"}","${t.priority}","${t.status}","${t.due_date}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeOrg.slug}-tasks-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAttendanceCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Session ID,Date,Member,Productive Seconds,Break Seconds,Status\n" +
      workSessions.map((s) => `"${s.id}","${s.work_date}","${s.member_name}","${s.productive_seconds}","${s.break_seconds}","${s.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeOrg.slug}-attendance-logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.user_full_name || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.user_email || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.employee_id || "").toLowerCase().includes(memberSearch.toLowerCase());
    const matchesType = memberTypeFilter === "ALL" || m.member_type === memberTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredTasks = tasks.filter((t) => {
    if (taskPriorityFilter === "ALL") return true;
    return t.priority === taskPriorityFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header with Org Switcher, Persona Switcher & Search */}
      <WorkspaceHeader
        organizations={organizations}
        activeOrg={activeOrg}
        onSelectOrg={handleSelectOrg}
        currentUser={currentUser}
        onSelectPersona={(persona) => setCurrentUser(persona)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <WorkspaceSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userRole={currentUser.role}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* TAB 1: WORKSPACE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Org Hero Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40">
                      {activeOrg.type} TENANT
                    </span>
                    <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                      {activeOrg.code}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                    {activeOrg.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1 font-normal">
                    Logged in as <strong>{currentUser.name}</strong> ({getRoleDisplayName(currentUser.role)}). All data is strictly scoped to this workspace.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsNewTaskOpen(true)}
                    size="sm"
                    className="bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Task
                  </Button>
                </div>
              </div>

              {/* AI & Operational Insights Desk (Section 3.K & 3.H) */}
              <Card className="p-6 border-blue-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-wide">Enterprise Operational & AI Insights Desk</h3>
                      <p className="text-[11px] text-blue-200">Deterministic workflow analysis & executive recommendation engine</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200">
                    Advisory Engine Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-300">Overdue Task Alert</span>
                    <p className="text-xl font-black text-amber-300">{insights.overdueTasks.length} Overdue</p>
                    <p className="text-[11px] text-blue-100">
                      {insights.overdueTasks.length > 0
                        ? "Immediate supervisor milestone review required"
                        : "All assigned deliverables are on schedule"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-300">Graduation Readiness</span>
                    <p className="text-xl font-black text-emerald-300">{insights.certificateEligibleInterns.length} Eligible</p>
                    <p className="text-[11px] text-blue-100">Interns meeting graduation attendance & scores</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-300">Productive Shift Average</span>
                    <p className="text-xl font-black text-white">{insights.averageDailyHours} hrs / day</p>
                    <p className="text-[11px] text-blue-100">Average logged shift duration across cohort</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2">
                  <span className="text-blue-400 font-bold whitespace-nowrap">Briefing:</span>
                  <p>{insights.executiveSummary}</p>
                </div>
              </Card>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Members</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{members.length}</p>
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">{insights.activeEmployees} Emp • {insights.activeInterns} Int</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Programs</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{programs.length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Intern & Academic</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tasks Pending</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{tasks.filter((t) => t.status !== "COMPLETED").length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{insights.completionRate}% Done</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Today</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{workSessions.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Clocked In</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leave Requests</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{leaveRequests.length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{leaveRequests.filter((l) => l.status === "PENDING").length} Pending</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued Docs</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{documents.length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Letters & Certs</p>
                </Card>
              </div>

              {/* Live Attendance Mini-Widget + Recent Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Live Attendance Timer Card */}
                <Card className="lg:col-span-5 p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Live Work Session Timer
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeSession?.status === "WORKING"
                        ? "bg-emerald-100 text-emerald-800"
                        : activeSession?.status === "ON_BREAK"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {activeSession?.status || "NOT_STARTED"}
                    </span>
                  </div>

                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-4xl font-mono font-black text-slate-900 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {activeSession?.status === "ON_BREAK"
                        ? `Paused on ${activeSession.current_break_type || "Break"}`
                        : "Active Productive Session"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {!activeSession || activeSession.status === "COMPLETED" ? (
                      <Button onClick={handleClockIn} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-5">
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Clock In
                      </Button>
                    ) : activeSession.status === "WORKING" ? (
                      <>
                        <Button onClick={() => handleStartBreak("LUNCH")} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                          <Pause className="w-3.5 h-3.5 mr-1" />
                          Lunch Break
                        </Button>
                        <Button onClick={() => handleStartBreak("SHORT_BREAK")} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                          <Pause className="w-3.5 h-3.5 mr-1" />
                          Short Break
                        </Button>
                        <Button onClick={handleClockOut} variant="danger" size="sm" className="rounded-xl text-xs font-bold">
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Clock Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleResumeBreak} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5">
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                          Resume Work
                        </Button>
                        <Button onClick={handleClockOut} variant="danger" size="sm" className="rounded-xl text-xs font-bold">
                          Clock Out
                        </Button>
                      </>
                    )}
                  </div>
                </Card>

                {/* Recent Task List Mini-View */}
                <Card className="lg:col-span-7 p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      Active Task Queue ({tasks.length})
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("tasks")} className="text-xs rounded-xl">
                      View All Kanban →
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.slice(0, 4).map((t) => (
                      <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              t.priority === "URGENT" ? "bg-red-100 text-red-700" :
                              t.priority === "HIGH" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {t.priority}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-normal">{t.assignee_name || "Unassigned"} • Due {t.due_date}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS DIRECTORY (Employee & Intern Management, Section 3.C & 3.D) */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Workforce & Member Directory</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Search and manage employees, interns, students, and mentors in {activeOrg.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={() => setIsAddMemberOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Add Member
                  </Button>
                  <Button onClick={handleExportMembersCSV} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or employee ID (e.g. EMP-APX-001)..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["ALL", "EMPLOYEE", "INTERN", "STUDENT", "ADMIN"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setMemberTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        memberTypeFilter === type
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Table */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-4">Member Name & ID</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Manager / Mentor</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                                {m.user_full_name?.slice(0, 1) || "M"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{m.user_full_name}</p>
                                <p className="text-[11px] text-blue-600 font-mono font-bold">{m.employee_id || "EMP-PENDING"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {getRoleDisplayName(m.role)}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700">{m.member_type}</td>
                          <td className="p-4 text-slate-700">{m.designation || m.job_title || "General"}</td>
                          <td className="p-4 text-slate-700">{m.mentor_name || m.manager_name || "Self-Managed"}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMember(m)}
                              className="text-xs font-semibold rounded-lg"
                            >
                              Profile
                            </Button>
                            {hasPermission(currentUser.role, "members.manage") && (
                              <Button
                                size="sm"
                                variant={m.status === "ACTIVE" ? "outline" : "primary"}
                                onClick={() => handleToggleMemberStatus(m.id)}
                                className={`text-[11px] rounded-lg ${
                                  m.status === "ACTIVE" ? "text-amber-700 border-amber-300 hover:bg-amber-50" : "bg-emerald-600 text-white"
                                }`}
                              >
                                <Power className="w-3 h-3 mr-1" />
                                {m.status === "ACTIVE" ? "Suspend" : "Activate"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Add Member Modal */}
              {isAddMemberOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-base font-black text-slate-900">Add New Workforce Member</h3>
                      <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Liam Zhang"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. liam@apextech.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Member Role</label>
                          <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as MemberRole)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="INTERN">INTERN</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TRAINER_MENTOR">TRAINER_MENTOR</option>
                            <option value="MANAGER_SUPERVISOR">MANAGER_SUPERVISOR</option>
                            <option value="HR_COORDINATOR">HR_COORDINATOR</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Member Type</label>
                          <select
                            value={newMemberType}
                            onChange={(e) => setNewMemberType(e.target.value as MemberType)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="INTERN">INTERN</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TRAINEE">TRAINEE</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Designation / Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Cloud Security Analyst"
                          value={newMemberDesignation}
                          onChange={(e) => setNewMemberDesignation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Skills (Comma-Separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. TypeScript, AWS, Kubernetes"
                          value={newMemberSkills}
                          onChange={(e) => setNewMemberSkills(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddMember} className="bg-blue-600 text-white font-bold">
                        Save Member
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Member Profile Drawer Modal */}
              {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-lg w-full bg-white rounded-2xl p-6 space-y-5 shadow-2xl animate-fadeIn">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">{selectedMember.user_full_name}</h3>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {selectedMember.employee_id || "EMP-001"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedMember.user_email}</p>
                      </div>
                      <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-600">
                        ✕
                      </button>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <p>Role: <strong>{getRoleDisplayName(selectedMember.role)}</strong></p>
                        <p>Member Type: <strong>{selectedMember.member_type}</strong></p>
                        <p>Designation: <strong>{selectedMember.designation || selectedMember.job_title}</strong></p>
                        <p>Assigned Manager/Mentor: <strong>{selectedMember.mentor_name || selectedMember.manager_name || "Elena Rostova"}</strong></p>
                        <p suppressHydrationWarning>Joined Workspace: <strong>{new Date(selectedMember.joined_at).toLocaleDateString()}</strong></p>
                        <p>Status: <strong className={selectedMember.status === "ACTIVE" ? "text-emerald-600" : "text-red-600"}>{selectedMember.status}</strong></p>
                      </div>

                      {selectedMember.skills && selectedMember.skills.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 text-blue-900">
                          <p className="font-bold">Verified Skills & Capabilities:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedMember.skills.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleToggleMemberStatus(selectedMember.id);
                          setSelectedMember(null);
                        }}
                        className="rounded-xl text-xs"
                      >
                        Toggle Status
                      </Button>
                      <Button onClick={() => setSelectedMember(null)} className="rounded-xl text-xs">Close</Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEPARTMENTS & TEAMS */}
          {activeTab === "structure" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Departments & Teams</h2>
                <p className="text-xs text-slate-500 font-normal">
                  Configure structural hierarchy for {activeOrg.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-600" />
                    Departments ({departments.length})
                  </h3>
                  <div className="space-y-3">
                    {departments.map((dept) => (
                      <div key={dept.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {dept.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-normal">{dept.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Functional Teams ({teams.length})
                  </h3>
                  <div className="space-y-3">
                    {teams.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        <p className="text-xs text-slate-600 font-normal">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: PROGRAMS & COHORTS */}
          {activeTab === "programs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Programs & Cohorts</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Manage active curriculum tracks and cohort placements.
                  </p>
                </div>
                <Button onClick={() => setIsNewProgramOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Program
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((prog) => (
                  <Card key={prog.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {prog.type}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {prog.enrolled_count}/{prog.capacity} Enrolled
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{prog.name}</h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 font-normal">{prog.description}</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                        <p>Tech: <strong>{prog.technology}</strong></p>
                        <p>Duration: <strong>{prog.duration}</strong></p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {isNewProgramOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                    <h3 className="text-lg font-black text-slate-900">Create New Program</h3>
                    <div className="space-y-3 text-xs">
                      <input
                        type="text"
                        placeholder="Program Name (e.g. Applied Machine Learning Practicum)"
                        value={newProgName}
                        onChange={(e) => setNewProgName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Technologies (e.g. PyTorch, FastAPI, Postgres)"
                        value={newProgTech}
                        onChange={(e) => setNewProgTech(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsNewProgramOpen(false)}>Cancel</Button>
                      <Button
                        onClick={() => {
                          if (newProgName) {
                            multiTenantStore.createProgram({
                              organization_id: activeOrg.id,
                              name: newProgName,
                              description: "Custom program registered by workspace admin.",
                              type: "Corporate Internship",
                              technology: newProgTech || "Full Stack",
                              duration: newProgDuration,
                              capacity: 30,
                              enrolled_count: 0,
                              learning_outcomes: ["Hands-on project deliverables"],
                              status: "ACTIVE",
                              start_date: new Date().toISOString().split("T")[0],
                              end_date: "2026-12-31",
                            });
                            setIsNewProgramOpen(false);
                            setNewProgName("");
                            reloadTenantData();
                          }
                        }}
                        className="bg-blue-600 text-white font-bold"
                      >
                        Create Program
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TASK BOARD (Section 3.F with Comments & Overdue Detection) */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Task Board & Kanban</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Interactive sprint management, priority filters, and team collaboration comments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsNewTaskOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Assign Task
                  </Button>
                  <Button onClick={handleExportTasksCSV} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setTaskPriorityFilter(priority)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      taskPriorityFilter === priority
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as TaskStatus[]).map((statusCol) => {
                  const colTasks = filteredTasks.filter((t) => t.status === statusCol);
                  return (
                    <div key={statusCol} className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {statusCol.replace("_", " ")}
                        </span>
                        <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {colTasks.map((task) => {
                          const today = new Date().toISOString().split("T")[0];
                          const isOverdue = task.due_date < today && task.status !== "COMPLETED";

                          return (
                            <Card key={task.id} className="p-4 bg-white border-slate-200 rounded-xl shadow-2xs space-y-2">
                              <div className="flex items-start justify-between">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                  task.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                  task.priority === "HIGH" ? "bg-amber-100 text-amber-700" :
                                  "bg-blue-100 text-blue-700"
                                }`}>
                                  {task.priority}
                                </span>
                                <div className="flex items-center gap-1">
                                  {isOverdue && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">{task.due_date}</span>
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 font-normal">{task.description}</p>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-slate-600">{task.assignee_name || "Assigned"}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedTaskComments(task)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    {task.comments?.length || 0}
                                  </button>
                                  {statusCol !== "COMPLETED" && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, statusCol === "BACKLOG" ? "IN_PROGRESS" : statusCol === "IN_PROGRESS" ? "IN_REVIEW" : "COMPLETED")}
                                      className="text-[10px] font-bold text-blue-600 hover:underline"
                                    >
                                      Move →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Task Comments Modal */}
              {selectedTaskComments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-lg w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{selectedTaskComments.title}</h3>
                        <p className="text-xs text-slate-400 font-mono">Collaboration Trail • {selectedTaskComments.id}</p>
                      </div>
                      <button onClick={() => setSelectedTaskComments(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {(!selectedTaskComments.comments || selectedTaskComments.comments.length === 0) ? (
                        <p className="text-xs text-slate-400 text-center py-4">No comments yet. Start the conversation!</p>
                      ) : (
                        selectedTaskComments.comments.map((c) => (
                          <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{c.author_name}</span>
                              <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">{new Date(c.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-600">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder="Type a sprint update or note..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <Button onClick={() => handleAddComment(selectedTaskComments.id)} size="sm" className="bg-blue-600 text-white font-bold">
                        <Send className="w-3.5 h-3.5 mr-1" /> Post
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* New Task Modal */}
              {isNewTaskOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                    <h3 className="text-lg font-black text-slate-900">Create New Task</h3>
                    <div className="space-y-3 text-xs">
                      <input
                        type="text"
                        placeholder="Task Title (e.g. Implement API rate limiter)"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Assignee Name (e.g. Sarah Chen)"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="LOW">Priority: LOW</option>
                        <option value="MEDIUM">Priority: MEDIUM</option>
                        <option value="HIGH">Priority: HIGH</option>
                        <option value="URGENT">Priority: URGENT</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateTask} className="bg-blue-600 text-white font-bold">
                        Save Task
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ATTENDANCE & WORK SESSIONS */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance & Work Sessions</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Real-time timer, multi-break state machine, and productive compliance records.
                  </p>
                </div>
                <Button onClick={handleExportAttendanceCSV} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export CSV
                </Button>
              </div>

              {/* Big Timer Console */}
              <Card className="p-8 border-slate-200 bg-white rounded-2xl shadow-sm text-center space-y-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeSession?.status === "WORKING" ? "bg-emerald-100 text-emerald-800" :
                  activeSession?.status === "ON_BREAK" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                }`}>
                  Current Status: {activeSession?.status || "NOT_STARTED"}
                </span>

                <div className="py-2">
                  <span className="text-5xl font-mono font-black text-slate-900 tracking-wider">
                    {formatTimer(timerSeconds)}
                  </span>
                  <p suppressHydrationWarning className="text-xs text-slate-400 mt-2 font-mono">
                    Clock-in: {activeSession?.clock_in_at ? new Date(activeSession.clock_in_at).toLocaleTimeString() : "--:--:--"}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!activeSession || activeSession.status === "COMPLETED" ? (
                    <Button onClick={handleClockIn} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-md">
                      <Play className="w-4 h-4 mr-2" />
                      Clock In Now
                    </Button>
                  ) : activeSession.status === "WORKING" ? (
                    <>
                      <Button onClick={() => handleStartBreak("LUNCH")} variant="outline" size="lg" className="rounded-xl">
                        Start Lunch Break
                      </Button>
                      <Button onClick={() => handleStartBreak("PERSONAL")} variant="outline" size="lg" className="rounded-xl">
                        Personal Break
                      </Button>
                      <Button onClick={handleClockOut} variant="danger" size="lg" className="rounded-xl font-bold">
                        <Square className="w-4 h-4 mr-2" />
                        Clock Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleResumeBreak} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl">
                        <Play className="w-4 h-4 mr-2" />
                        Resume Productive Shift
                      </Button>
                      <Button onClick={handleClockOut} variant="danger" size="lg" className="rounded-xl">
                        Clock Out
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* Session History Table */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Work Session Attendance Logs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Member</th>
                        <th className="p-3.5">Clock In</th>
                        <th className="p-3.5">Clock Out</th>
                        <th className="p-3.5">Productive Time</th>
                        <th className="p-3.5">Break Time</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {workSessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">{s.work_date}</td>
                          <td className="p-3.5">{s.member_name}</td>
                          <td suppressHydrationWarning className="p-3.5 font-mono">{new Date(s.clock_in_at).toLocaleTimeString()}</td>
                          <td suppressHydrationWarning className="p-3.5 font-mono">{s.clock_out_at ? new Date(s.clock_out_at).toLocaleTimeString() : "--:--"}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-600">
                            {Math.floor(s.productive_seconds / 3600)}h {Math.floor((s.productive_seconds % 3600) / 60)}m
                          </td>
                          <td className="p-3.5 font-mono text-slate-500">
                            {Math.floor(s.break_seconds / 60)}m
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: LEAVE MANAGEMENT (Section 3.E) */}
          {activeTab === "leaves" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Leave Management</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Submit leave applications and process team absence requests with audit tracking.
                  </p>
                </div>
                <Button onClick={() => setIsNewLeaveOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Request Leave
                </Button>
              </div>

              {/* Leave Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Requests</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{leaveRequests.length}</p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {leaveRequests.filter((l) => l.status === "APPROVED").length}
                  </p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Review</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {leaveRequests.filter((l) => l.status === "PENDING").length}
                  </p>
                </Card>
                <Card className="p-4 border-slate-200 bg-white rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Days Approved</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {leaveRequests.filter((l) => l.status === "APPROVED").reduce((sum, l) => sum + l.days_count, 0)} Days
                  </p>
                </Card>
              </div>

              {/* Leave Requests Table */}
              <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Leave Applications & Absence Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-3.5">Member</th>
                        <th className="p-3.5">Leave Type</th>
                        <th className="p-3.5">Duration</th>
                        <th className="p-3.5">Days</th>
                        <th className="p-3.5">Reason</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {leaveRequests.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">{l.member_name}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-700">
                              {l.leave_type}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">{l.start_date} to {l.end_date}</td>
                          <td className="p-3.5 font-bold">{l.days_count} d</td>
                          <td className="p-3.5 max-w-xs truncate text-slate-500">{l.reason}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              l.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                              l.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {l.status === "PENDING" && hasPermission(currentUser.role, "members.manage") ? (
                              <>
                                <button
                                  onClick={() => handleReviewLeave(l.id, "APPROVED")}
                                  className="text-emerald-700 font-bold hover:underline"
                                >
                                  Approve
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  onClick={() => handleReviewLeave(l.id, "REJECTED")}
                                  className="text-red-600 font-bold hover:underline"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">{l.reviewer_name || "Processed"}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Request Leave Modal */}
              {isNewLeaveOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                    <h3 className="text-lg font-black text-slate-900">Request Leave of Absence</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                        <select
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="CASUAL">CASUAL</option>
                          <option value="SICK">SICK</option>
                          <option value="ANNUAL">ANNUAL</option>
                          <option value="STUDY">STUDY / EXAM</option>
                          <option value="EMERGENCY">EMERGENCY</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                          <input
                            type="date"
                            value={leaveStartDate}
                            onChange={(e) => setLeaveStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">End Date</label>
                          <input
                            type="date"
                            value={leaveEndDate}
                            onChange={(e) => setLeaveEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Days Count</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={leaveDays}
                          onChange={(e) => setLeaveDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Reason / Justification *</label>
                        <textarea
                          rows={3}
                          placeholder="Please provide details for supervisor review..."
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setIsNewLeaveOpen(false)}>Cancel</Button>
                      <Button onClick={handleRequestLeave} className="bg-blue-600 text-white font-bold">
                        Submit Application
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DAILY WORK REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Work Reports</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Submit daily activity summaries and receive supervisor feedback.
                  </p>
                </div>
                <Button onClick={() => setIsNewReportOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Submit Daily Report
                </Button>
              </div>

              <div className="space-y-4">
                {dailyReports.map((rep) => (
                  <Card key={rep.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{rep.member_name}</span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">• {rep.report_date}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                        rep.status === "UNDER_REVIEW" ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <p><strong>Activities:</strong> {rep.activities}</p>
                      <p><strong>Deliverables Completed:</strong> {rep.work_completed}</p>
                      {rep.challenges && <p className="text-amber-700"><strong>Blockers / Challenges:</strong> {rep.challenges}</p>}
                      {rep.reviewer_feedback && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs mt-2">
                          <strong>Supervisor Feedback:</strong> &quot;{rep.reviewer_feedback}&quot;
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {isNewReportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-lg w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                    <h3 className="text-lg font-black text-slate-900">Submit Daily Work Report</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 mb-1 block">Key Activities Completed *</label>
                        <textarea
                          rows={3}
                          placeholder="Summary of modules built, bug fixes, or documents written..."
                          value={reportActivities}
                          onChange={(e) => setReportActivities(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 mb-1 block">Challenges / Blockers Encountered</label>
                        <textarea
                          rows={2}
                          placeholder="Any dependencies, questions for mentors, or technical blockers..."
                          value={reportBlockers}
                          onChange={(e) => setReportBlockers(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmitReport} className="bg-blue-600 text-white font-bold">
                        Submit for Review
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: LEARNING CENTER (LMS) */}
          {activeTab === "learning" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Learning Center (LMS)</h2>
                <p className="text-xs text-slate-500 font-normal">
                  Curated technical modules, study materials, and engineering guides for {activeOrg.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningMaterials.map((mat) => (
                  <Card key={mat.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {mat.content_type}
                        </span>
                        <span className="text-xs text-slate-400">{mat.estimated_duration}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{mat.title}</h3>
                      <p className="text-xs text-slate-600 mt-2 font-normal">{mat.description}</p>
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {mat.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{mat.category}</span>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold text-blue-600">
                        Open Resource →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: ASSESSMENTS & MCQS */}
          {activeTab === "assessments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assessments & MCQ Runner</h2>
                <p className="text-xs text-slate-500 font-normal">
                  Timed technical examinations with server-side grading and instant feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessments.map((asm) => (
                  <Card key={asm.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {asm.status}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">{asm.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-normal">{asm.description}</p>
                    <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <p className="text-slate-400 text-[10px]">DURATION</p>
                        <p className="font-bold text-slate-900">{asm.duration_minutes} Mins</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50">
                        <p className="text-slate-400 text-[10px]">TOTAL MARKS</p>
                        <p className="font-bold text-slate-900">{asm.total_marks}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50">
                        <p className="text-slate-400 text-[10px]">PASS THRESHOLD</p>
                        <p className="font-bold text-emerald-600">{asm.passing_threshold}%</p>
                      </div>
                    </div>
                    <Button onClick={() => handleStartExam(asm)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2.5">
                      Launch Secure Exam Runner
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Exam Runner Modal */}
              {examRunnerAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <Card className="max-w-2xl w-full bg-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{examRunnerAssessment.title}</h3>
                        <p className="text-xs text-slate-500 font-mono">Total Questions: {examRunnerAssessment.questions.length} • Passing: {examRunnerAssessment.passing_threshold}%</p>
                      </div>
                      <button onClick={() => setExamRunnerAssessment(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    {!examResult ? (
                      <div className="space-y-6">
                        {examRunnerAssessment.questions.map((q, idx) => (
                          <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <p className="text-xs font-bold text-slate-900">
                              Question {idx + 1}: {q.question}
                            </p>
                            <div className="space-y-2">
                              {q.options?.map((opt, oIdx) => (
                                <label key={oIdx} className="flex items-start p-2.5 rounded-lg border border-slate-200 hover:bg-white cursor-pointer text-xs">
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={examAnswers[q.id] === opt}
                                    onChange={() => setExamAnswers({ ...examAnswers, [q.id]: opt })}
                                    className="mt-0.5 mr-2.5"
                                  />
                                  <span className="text-slate-700">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="pt-2 flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setExamRunnerAssessment(null)}>Cancel</Button>
                          <Button onClick={handleSubmitExam} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 rounded-xl">
                            Submit Answers
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                          examResult.passed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                        }`}>
                          {examResult.passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">
                          {examResult.passed ? "Congratulations, You Passed!" : "Assessment Threshold Not Met"}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Score: <strong>{examResult.score} / {examRunnerAssessment.total_marks}</strong> ({examResult.percentage}%)
                        </p>
                        <Button onClick={() => setExamRunnerAssessment(null)} className="rounded-xl">
                          Return to Workspace
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: MENTORSHIP & REVIEWS (Section 3.D & 3.G) */}
          {activeTab === "mentorship" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentorship & Weekly Progress Reviews</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Mentor-to-intern milestone monitoring, performance rubrics, and confidential engineering feedback.
                  </p>
                </div>
                {hasPermission(currentUser.role, "members.manage") && (
                  <Button onClick={() => setIsNewMentorReviewOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Record Weekly Review
                  </Button>
                )}
              </div>

              {/* Mentorship Pairs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentorshipReviews.map((rev) => (
                  <Card key={rev.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            WEEK #{rev.week_number}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.milestone_status === "EXCELLING" ? "bg-emerald-100 text-emerald-800" :
                            rev.milestone_status === "ON_TRACK" ? "bg-blue-100 text-blue-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {rev.milestone_status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{rev.intern_name}</h3>
                        <p className="text-xs text-slate-400">Mentor: {rev.mentor_name}</p>
                      </div>
                      <GraduationCap className="w-6 h-6 text-indigo-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Technical</p>
                        <p className="text-base font-black text-blue-600 mt-0.5">{rev.technical_score}/10</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Communication</p>
                        <p className="text-base font-black text-indigo-600 mt-0.5">{rev.communication_score}/10</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Initiative</p>
                        <p className="text-base font-black text-emerald-600 mt-0.5">{rev.initiative_score}/10</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-1">
                      <span className="font-bold">Mentor Written Evaluation:</span>
                      <p className="leading-relaxed">&quot;{rev.feedback}&quot;</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Record Review Modal */}
              {isNewMentorReviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <Card className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                    <h3 className="text-lg font-black text-slate-900">Record Intern Milestone Review</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Select Intern</label>
                        <select
                          value={reviewInternId}
                          onChange={(e) => setReviewInternId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          {members.filter((m) => m.member_type === "INTERN" || m.member_type === "STUDENT").map((intern) => (
                            <option key={intern.id} value={intern.id}>
                              {intern.user_full_name} ({intern.employee_id || intern.user_email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Technical (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={reviewTechScore}
                            onChange={(e) => setReviewTechScore(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Comm (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={reviewCommScore}
                            onChange={(e) => setReviewCommScore(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Initiative (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={reviewInitScore}
                            onChange={(e) => setReviewInitScore(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Milestone Progress</label>
                        <select
                          value={reviewMilestone}
                          onChange={(e) => setReviewMilestone(e.target.value as "ON_TRACK" | "EXCELLING" | "NEEDS_SUPPORT")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="EXCELLING">EXCELLING</option>
                          <option value="ON_TRACK">ON_TRACK</option>
                          <option value="NEEDS_SUPPORT">NEEDS_SUPPORT</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Detailed Written Feedback *</label>
                        <textarea
                          rows={3}
                          placeholder="Specific strengths, code quality, and areas for improvement..."
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setIsNewMentorReviewOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmitMentorReview} className="bg-blue-600 text-white font-bold">
                        Save Review
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: DOCUMENTS & CERTIFICATES */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Documents & Credentials</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Verified letters and certificates issued under {activeOrg.name}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {doc.document_type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{doc.title}</h3>
                        <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">{doc.document_number}</p>
                      </div>
                      <Award className="w-6 h-6 text-amber-500" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p>Recipient: <strong>{doc.recipient_name}</strong> ({doc.recipient_role})</p>
                      <p>Issued Date: <strong>{doc.issued_date}</strong></p>
                      <p className="text-[10px] text-slate-400 font-mono">Code: {doc.verification_code}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link href={`/verify/${encodeURIComponent(doc.document_number)}`} target="_blank">
                        <span className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                          Public Verification <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => setSelectedDocPreview(doc)} className="rounded-xl text-xs font-bold">
                        Preview Certificate
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Document Preview Modal */}
              {selectedDocPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <Card className="max-w-2xl w-full bg-white rounded-2xl p-8 space-y-6 shadow-2xl border-4 border-double border-slate-300 animate-fadeIn">
                    <div className="text-center space-y-2 pb-6 border-b border-slate-200">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{activeOrg.name}</h2>
                      <p className="text-xs text-slate-500 font-mono">OFFICIAL WORKFORCE & INTERNSHIP CREDENTIAL</p>
                      <p className="text-xs font-bold text-blue-600">ID: {selectedDocPreview.document_number}</p>
                    </div>

                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">This officially certifies that</p>
                      <h3 className="text-3xl font-black text-slate-900">{selectedDocPreview.recipient_name}</h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        has successfully completed all requirements, active work sessions, and technical deliverables for the track &quot;
                        <strong>{selectedDocPreview.template_data?.program_or_track}</strong>&quot;.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{selectedDocPreview.template_data?.signatory_name}</p>
                        <p className="text-slate-500 text-[10px]">{selectedDocPreview.template_data?.signatory_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-emerald-600 font-bold">VERIFIED ON INTERNDESK</p>
                        <p className="text-slate-400 text-[10px]">Code: {selectedDocPreview.verification_code}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button onClick={() => setSelectedDocPreview(null)} className="rounded-xl">Close Preview</Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 13: ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Announcements</h2>
                <p className="text-xs text-slate-500 font-normal">
                  Publish notices across departments, programs, and teams.
                </p>
              </div>

              <div className="space-y-4">
                {announcements.map((anc) => (
                  <Card key={anc.id} className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {anc.target_scope}
                      </span>
                      <span className="text-xs text-slate-400">{anc.author_name}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{anc.content}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 14: ANALYTICS & REPORTS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analytics & Operational Metrics</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Aggregate attendance, task completion, and learning metrics for {activeOrg.name}.
                  </p>
                </div>
                <Button onClick={handleExportMembersCSV} size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export Data
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400">Total Productive Hours</p>
                  <p className="text-3xl font-black text-blue-600">{insights.totalWorkHours} hrs</p>
                  <p className="text-xs text-emerald-600 font-medium">↑ Verified shift log</p>
                </Card>
                <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400">Task Completion Rate</p>
                  <p className="text-3xl font-black text-emerald-600">{insights.completionRate}%</p>
                  <p className="text-xs text-slate-500">{insights.completedTasks} of {insights.totalTasks} deliverables</p>
                </Card>
                <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400">Graduation Readiness</p>
                  <p className="text-3xl font-black text-indigo-600">{insights.certificateEligibleInterns.length} Interns</p>
                  <p className="text-xs text-slate-500">Exceeded completion threshold</p>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 15: SETTINGS & AUDIT LOGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Settings & Security</h2>
                <p className="text-xs text-slate-500 font-normal">
                  Manage organization code, joining policies, and inspect immutable audit events.
                </p>
              </div>

              <Card className="p-6 border-slate-200 bg-white rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Organization Discovery Code</h3>
                    <p className="text-xs text-slate-500">Members use this code to request joining this workspace.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono font-black text-blue-900 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-200">
                      {activeOrg.code}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        multiTenantStore.rotateOrganizationCode(activeOrg.id);
                        reloadTenantData();
                      }}
                      className="rounded-xl text-xs font-bold"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Rotate Code
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden space-y-3 p-4">
                <h3 className="text-sm font-bold text-slate-900">Tenant Audit Logs</h3>
                <div className="space-y-2 text-xs">
                  {multiTenantStore.getAuditLogs(activeOrg.id).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-blue-600">{log.action}</span>
                        <span className="text-slate-500 ml-2">by {log.actor_email}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.resource}</p>
                      </div>
                      <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        activeOrg={activeOrg}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

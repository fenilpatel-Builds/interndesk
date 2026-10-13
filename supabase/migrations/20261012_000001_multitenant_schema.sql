-- ==============================================================================
-- InternDesk: Master Multi-Tenant Database Schema
-- Version: 2.0.0 (Pure Multi-Tenant Enterprise Architecture)
-- Non-Negotiable Rules: No payment tables, Strict Organization Data Isolation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "ORG-7K4P9X"
    type VARCHAR(40) NOT NULL CHECK (type IN ('CORPORATE', 'EDUCATIONAL', 'TRAINING', 'INTERNSHIP_PROVIDER', 'HYBRID')),
    status VARCHAR(40) NOT NULL DEFAULT 'VERIFICATION_PENDING' CHECK (
        status IN ('DRAFT', 'EMAIL_VERIFICATION_PENDING', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED')
    ),
    official_email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    website VARCHAR(255),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    size VARCHAR(50) NOT NULL DEFAULT '50-200',
    industry_or_category VARCHAR(100) NOT NULL,
    logo_url TEXT,
    description TEXT,
    joining_policy VARCHAR(40) NOT NULL DEFAULT 'REQUEST_APPROVAL' CHECK (
        joining_policy IN ('CODE_ONLY', 'INVITATION_ONLY', 'REQUEST_APPROVAL', 'OPEN_VERIFIED')
    ),
    allowed_email_domains TEXT[] DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{
        "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "expectedDailyHours": 8,
        "gracePeriodMinutes": 15,
        "allowedBreakMinutes": 60,
        "timeZone": "Asia/Kolkata",
        "dateFormat": "DD/MM/YYYY",
        "requireReportReview": true,
        "autoApproveAttendance": false
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_organizations_code ON public.organizations(code);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

-- 2. ORGANIZATION VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.organization_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    method VARCHAR(40) NOT NULL CHECK (method IN ('OFFICIAL_DOMAIN', 'WEBSITE_VERIFICATION', 'MANUAL_SUPERADMIN', 'DOCUMENTS')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_evidence TEXT,
    review_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ORGANIZATION MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) or profiles(id)
    role VARCHAR(40) NOT NULL CHECK (
        role IN ('SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'HR_COORDINATOR', 'MANAGER_SUPERVISOR', 'TRAINER_MENTOR', 'EMPLOYEE', 'INTERN', 'STUDENT', 'AUDITOR')
    ),
    member_type VARCHAR(40) NOT NULL CHECK (
        member_type IN ('STUDENT', 'INTERN', 'EMPLOYEE', 'TRAINEE', 'FACULTY', 'TRAINER', 'MENTOR', 'ADMIN')
    ),
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'INVITATION_PENDING', 'JOIN_REQUEST_PENDING', 'SUSPENDED', 'REJECTED', 'REMOVED', 'LEFT')
    ),
    department_id UUID,
    team_id UUID,
    job_title VARCHAR(150),
    custom_profile JSONB DEFAULT '{}'::jsonb,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON public.organization_memberships(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON public.organization_memberships(role);

-- 4. ORGANIZATION INVITATIONS
CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL,
    member_type VARCHAR(40) NOT NULL,
    invitation_token VARCHAR(128) UNIQUE NOT NULL,
    invited_by UUID NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ORGANIZATION JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.organization_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    desired_member_type VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    request_note TEXT,
    rejection_reason TEXT,
    reviewed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    head_member_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_member_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PROGRAMS
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    technology VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    capacity INTEGER NOT NULL DEFAULT 50,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    learning_outcomes TEXT[] DEFAULT '{}',
    curriculum_summary TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. BATCHES / COHORTS
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'UPCOMING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNING', 'ACTIVE', 'REVIEW', 'COMPLETED')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assignee_id UUID,
    assignee_name VARCHAR(255),
    reviewer_id UUID,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('BACKLOG', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'OVERDUE')
    ),
    start_date DATE,
    due_date DATE NOT NULL,
    estimated_effort VARCHAR(50),
    acceptance_criteria TEXT,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 12. WORK SESSIONS (Attendance Engine)
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    member_name VARCHAR(255),
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in_at TIMESTAMPTZ NOT NULL,
    clock_out_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'WORKING' CHECK (status IN ('NOT_STARTED', 'WORKING', 'ON_BREAK', 'COMPLETED')),
    total_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_seconds >= 0),
    productive_seconds INTEGER NOT NULL DEFAULT 0 CHECK (productive_seconds >= 0),
    break_seconds INTEGER NOT NULL DEFAULT 0 CHECK (break_seconds >= 0),
    correction_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_work_sessions_org ON public.work_sessions(organization_id);

-- 13. WORK BREAKS
CREATE TABLE IF NOT EXISTS public.work_breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
    break_type VARCHAR(30) NOT NULL CHECK (break_type IN ('LUNCH', 'PERSONAL', 'SHORT_BREAK', 'TEA', 'OTHER')),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0)
);

-- 14. DAILY WORK REPORTS
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    member_name VARCHAR(255),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    project_or_program VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'NEEDS_REVISION')),
    activities TEXT NOT NULL,
    work_completed TEXT NOT NULL,
    challenges TEXT,
    next_steps TEXT,
    reviewer_id UUID,
    reviewer_feedback TEXT,
    entries JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_org ON public.daily_reports(organization_id);

-- 15. LEARNING MATERIALS
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(40) NOT NULL CHECK (content_type IN ('PDF', 'DOCUMENT', 'VIDEO', 'EXTERNAL_LINK', 'CODE_EXAMPLE', 'MODULE')),
    category VARCHAR(100) NOT NULL,
    url_or_path TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    estimated_duration VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_marks INTEGER NOT NULL DEFAULT 100,
    passing_threshold INTEGER NOT NULL DEFAULT 70,
    attempt_limit INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total_marks INTEGER NOT NULL DEFAULT 100,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    passed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb
);

-- 18. ISSUED DOCUMENTS & CERTIFICATES
CREATE TABLE IF NOT EXISTS public.issued_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    document_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. "IND-APX-2026-0042"
    document_type VARCHAR(50) NOT NULL CHECK (
        document_type IN ('OFFER_LETTER', 'INTERNSHIP_LETTER', 'EXPERIENCE_LETTER', 'COMPLETION_CERTIFICATE', 'TRAINING_CERTIFICATE', 'PARTICIPATION_CERTIFICATE')
    ),
    title VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(100) NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('NOT_ELIGIBLE', 'ELIGIBLE', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED', 'REVOKED')),
    verification_code VARCHAR(64) UNIQUE NOT NULL,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documents_number ON public.issued_documents(document_number);

-- 19. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_scope VARCHAR(30) NOT NULL DEFAULT 'ORG_WIDE' CHECK (target_scope IN ('ORG_WIDE', 'DEPARTMENT', 'TEAM', 'PROGRAM', 'BATCH')),
    target_name VARCHAR(255),
    author_name VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANT', 'URGENT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.tenant_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

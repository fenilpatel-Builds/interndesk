-- ==============================================================================
-- InternDesk: Single Institute Edition Master Schema & RLS Migration
-- Institute: Akash Technolabs Private Limited
-- Version: 2.0.0
-- Migration Date: 2026-10-27
-- Status: Written and Verified Locally against Single Institute Requirements
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    head_of_department VARCHAR(255),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed central departments for Akash Technolabs
INSERT INTO public.departments (id, name, code, head_of_department, description)
VALUES
    ('dept-cse', 'Computer Science & Engineering', 'CSE', 'Prof. Akash Padhiyar', 'Core computing, systems engineering, algorithms, and full-stack software development.'),
    ('dept-it', 'Information Technology', 'IT', 'Prof. Fenil Patel', 'Applied computing, web technologies, enterprise databases, and cloud systems.'),
    ('dept-aiml', 'Artificial Intelligence & Machine Learning', 'AIML', 'Dr. Priya Sharma', 'Deep learning, neural networks, predictive models, NLP, and intelligent agents.'),
    ('dept-ds', 'Data Science & Business Analytics', 'DS', 'Prof. Harshit Mehta', 'Statistical computing, big data pipelines, visualization, and business intelligence.'),
    ('dept-cloud', 'Cloud Computing & DevOps', 'CLOUD', 'Prof. Rajesh Varma', 'Containerization, infrastructure as code, CI/CD pipelines, AWS, and Kubernetes.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    head_of_department = EXCLUDED.head_of_department,
    description = EXCLUDED.description;

-- 3. ACADEMIC PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.academic_programs (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    duration_years INTEGER NOT NULL DEFAULT 4,
    degree_type VARCHAR(32) NOT NULL DEFAULT 'BACHELORS',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed central academic programs
INSERT INTO public.academic_programs (id, department_id, name, code, duration_years, degree_type)
VALUES
    ('prog-btech-cse', 'dept-cse', 'B.Tech in Computer Science & Engineering', 'BTECH-CSE', 4, 'BACHELORS'),
    ('prog-btech-it', 'dept-it', 'B.Tech in Information Technology', 'BTECH-IT', 4, 'BACHELORS'),
    ('prog-btech-aiml', 'dept-aiml', 'B.Tech in Artificial Intelligence & Machine Learning', 'BTECH-AIML', 4, 'BACHELORS'),
    ('prog-mca', 'dept-cse', 'Master of Computer Applications (MCA)', 'MCA', 2, 'MASTERS'),
    ('prog-bca', 'dept-it', 'Bachelor of Computer Applications (BCA)', 'BCA', 3, 'BACHELORS'),
    ('prog-diploma-ce', 'dept-cse', 'Diploma in Computer Engineering', 'DIPLOMA-CE', 3, 'DIPLOMA')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code;

-- 4. ACTIVITIES TABLE (Single Institute Activity Lifecycle)
CREATE TABLE IF NOT EXISTS public.activities (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'PROJECT_PRACTICUM' CHECK (
        category IN ('PROJECT_PRACTICUM', 'RESEARCH_PAPER', 'TECHNICAL_ASSESSMENT', 'LAB_EXERCISE', 'WORKSHOP_CHALLENGE')
    ),
    department_id VARCHAR(64) REFERENCES public.departments(id) ON DELETE SET NULL,
    course_name VARCHAR(255),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    max_score INTEGER NOT NULL DEFAULT 100,
    created_by VARCHAR(255) NOT NULL DEFAULT 'Akash Padhiyar',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ACTIVITY SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.activity_submissions (
    id VARCHAR(64) PRIMARY KEY,
    activity_id VARCHAR(64) NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL, -- e.g. AKT-2026-081
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    department_id VARCHAR(64) REFERENCES public.departments(id) ON DELETE SET NULL,
    report_content TEXT NOT NULL,
    attachment_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED' CHECK (
        status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION')
    ),
    score INTEGER CHECK (score >= 0 AND score <= 500),
    reviewer_id VARCHAR(64),
    reviewer_name VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_activity_student UNIQUE (activity_id, student_email)
);

-- 6. USER ROLES AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER_MENTOR', 'STUDENT')),
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Departments & Programs: Public Read for all authenticated users
CREATE POLICY "Departments are readable by all authenticated users"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Academic programs are readable by all authenticated users"
    ON public.academic_programs FOR SELECT
    TO authenticated
    USING (true);

-- Activities: Published activities are readable by all authenticated students and staff
CREATE POLICY "Activities read policy"
    ON public.activities FOR SELECT
    TO authenticated
    USING (
        status = 'PUBLISHED' OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid() AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')
        )
    );

-- Activities write: Admin only
CREATE POLICY "Activities write policy"
    ON public.activities FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid() AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')
        )
    );

-- Submissions read: Students can only read their own submissions; Admins can read all
CREATE POLICY "Submissions select policy"
    ON public.activity_submissions FOR SELECT
    TO authenticated
    USING (
        student_email = auth.jwt() ->> 'email' OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid() AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER_MENTOR')
        )
    );

-- Submissions insert: Students can insert their own submissions
CREATE POLICY "Submissions insert policy"
    ON public.activity_submissions FOR INSERT
    TO authenticated
    WITH CHECK (
        student_email = auth.jwt() ->> 'email' OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid() AND p.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Submissions update: Reviewers/Admins can update status and feedback
CREATE POLICY "Submissions review policy"
    ON public.activity_submissions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_user_id = auth.uid() AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER_MENTOR')
        )
    );

-- INDEXES for Query Performance
CREATE INDEX IF NOT EXISTS idx_activities_department ON public.activities(department_id);
CREATE INDEX IF NOT EXISTS idx_activities_deadline ON public.activities(deadline);
CREATE INDEX IF NOT EXISTS idx_submissions_activity ON public.activity_submissions(activity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.activity_submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.activity_submissions(status);

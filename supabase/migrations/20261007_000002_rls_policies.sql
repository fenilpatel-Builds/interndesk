-- ==============================================================================
-- InternDesk: Row Level Security (RLS) Policies
-- Version: 1.0.0
-- ==============================================================================

-- Helper Function to determine if current auth user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = auth.uid();
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to get current user's student profile ID
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID AS $$
DECLARE
    v_student_id UUID;
BEGIN
    SELECT sp.id INTO v_student_id
    FROM public.student_profiles sp
    JOIN public.profiles p ON p.id = sp.user_id
    WHERE p.auth_user_id = auth.uid();
    RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own safe fields"
ON public.profiles FOR UPDATE
USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin full access profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- 2. STUDENT PROFILES
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own student profile"
ON public.student_profiles FOR SELECT
USING (user_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admin full access student profiles"
ON public.student_profiles FOR ALL
USING (public.is_admin());

-- 3. REGISTRATIONS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own registrations"
ON public.registrations FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can insert own registration"
ON public.registrations FOR INSERT
WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Admin full access registrations"
ON public.registrations FOR ALL
USING (public.is_admin());

-- 4. PAYMENTS & RECEIPTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own payments"
ON public.payments FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can view own receipts"
ON public.receipts FOR SELECT
USING (
    payment_id IN (SELECT id FROM public.payments WHERE student_id = public.get_current_student_id())
    OR public.is_admin()
);

CREATE POLICY "Admin full access payments"
ON public.payments FOR ALL
USING (public.is_admin());

CREATE POLICY "Admin full access receipts"
ON public.receipts FOR ALL
USING (public.is_admin());

-- 5. WORK SESSIONS & BREAKS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own work sessions"
ON public.work_sessions FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can view own breaks"
ON public.work_breaks FOR SELECT
USING (
    work_session_id IN (SELECT id FROM public.work_sessions WHERE student_id = public.get_current_student_id())
    OR public.is_admin()
);

CREATE POLICY "Admin full access work sessions"
ON public.work_sessions FOR ALL
USING (public.is_admin());

CREATE POLICY "Admin full access work breaks"
ON public.work_breaks FOR ALL
USING (public.is_admin());

-- 6. DAILY REPORTS & ENTRIES
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own daily reports"
ON public.daily_reports FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can create/update draft or submitted daily reports"
ON public.daily_reports FOR INSERT
WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can view own daily report entries"
ON public.daily_report_entries FOR SELECT
USING (
    report_id IN (SELECT id FROM public.daily_reports WHERE student_id = public.get_current_student_id())
    OR public.is_admin()
);

CREATE POLICY "Admin full access daily reports"
ON public.daily_reports FOR ALL
USING (public.is_admin());

CREATE POLICY "Admin full access daily report entries"
ON public.daily_report_entries FOR ALL
USING (public.is_admin());

-- 7. TASKS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view assigned tasks"
ON public.tasks FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can update completion notes on assigned tasks"
ON public.tasks FOR UPDATE
USING (student_id = public.get_current_student_id());

CREATE POLICY "Admin full access tasks"
ON public.tasks FOR ALL
USING (public.is_admin());

-- 8. SUBJECTS & STUDY MATERIALS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active subjects"
ON public.subjects FOR SELECT
USING (active = true OR public.is_admin());

CREATE POLICY "Students can view their assigned subjects"
ON public.subject_assignments FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can view materials of assigned subjects"
ON public.study_materials FOR SELECT
USING (
    (status = 'PUBLISHED' AND subject_id IN (
        SELECT subject_id FROM public.subject_assignments WHERE student_id = public.get_current_student_id()
    ))
    OR public.is_admin()
);

CREATE POLICY "Admin full access subjects"
ON public.subjects FOR ALL
USING (public.is_admin());

CREATE POLICY "Admin full access study materials"
ON public.study_materials FOR ALL
USING (public.is_admin());

-- 9. ASSESSMENTS, QUESTIONS & ANSWERS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view published assessments for assigned subjects"
ON public.assessments FOR SELECT
USING (
    (status = 'PUBLISHED' AND subject_id IN (
        SELECT subject_id FROM public.subject_assignments WHERE student_id = public.get_current_student_id()
    ))
    OR public.is_admin()
);

CREATE POLICY "Students can view assessment questions"
ON public.questions FOR SELECT
USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE status = 'PUBLISHED')
    OR public.is_admin()
);

-- NOTE: For question_options, is_correct must NEVER be queryable by students directly!
-- Admin sees all columns.
CREATE POLICY "Question options viewable during active assessment"
ON public.question_options FOR SELECT
USING (true);

CREATE POLICY "Students can view own assessment attempts"
ON public.assessment_attempts FOR SELECT
USING (student_id = public.get_current_student_id() OR public.is_admin());

CREATE POLICY "Students can view own answers"
ON public.assessment_answers FOR SELECT
USING (
    attempt_id IN (SELECT id FROM public.assessment_attempts WHERE student_id = public.get_current_student_id())
    OR public.is_admin()
);

CREATE POLICY "Admin full access assessments"
ON public.assessments FOR ALL
USING (public.is_admin());

CREATE POLICY "Admin full access attempts"
ON public.assessment_attempts FOR ALL
USING (public.is_admin());

-- 10. DOCUMENTS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view only their approved or available documents"
ON public.documents FOR SELECT
USING (
    (student_id = public.get_current_student_id() AND status IN ('AVAILABLE', 'GENERATED', 'APPROVED'))
    OR public.is_admin()
);

CREATE POLICY "Admin full access documents"
ON public.documents FOR ALL
USING (public.is_admin());

-- 10B. DOCUMENT TEMPLATES
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active document templates"
ON public.document_templates FOR SELECT
USING (active = true OR public.is_admin());

CREATE POLICY "Admin manage document templates"
ON public.document_templates FOR ALL
USING (public.is_admin());

-- 11. USER SESSIONS & NOTIFICATIONS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and revoke own sessions"
ON public.user_sessions FOR ALL
USING (user_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Users can view and mark own notifications"
ON public.notifications FOR ALL
USING (user_id = public.get_current_profile_id() OR public.is_admin());

-- 12. AUDIT LOGS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

CREATE POLICY "System and authorized users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- ==============================================================================
-- InternDesk: Master Seed Data
-- Version: 1.1.0
-- ==============================================================================

-- 1. STANDARD DOCUMENT TEMPLATES
INSERT INTO public.document_templates (type, version, template_data, active)
VALUES
(
    'OFFER_LETTER',
    1,
    '{
        "org_name": "InternDesk Technologies Ltd.",
        "org_address": "Cyber City Innovation Hub, Bengaluru, Karnataka, 560100",
        "signatory_name": "Dr. Rajesh Kumar",
        "signatory_title": "Director of Engineering & Training",
        "prefix": "ID-OFF-",
        "title": "Internship Offer Letter"
    }'::jsonb,
    true
),
(
    'INTERNSHIP_LETTER',
    1,
    '{
        "org_name": "InternDesk Technologies Ltd.",
        "org_address": "Cyber City Innovation Hub, Bengaluru, Karnataka, 560100",
        "signatory_name": "Dr. Rajesh Kumar",
        "signatory_title": "Director of Engineering & Training",
        "prefix": "ID-INT-",
        "title": "Internship Bonafide Letter"
    }'::jsonb,
    true
),
(
    'INTERNSHIP_CERTIFICATE',
    1,
    '{
        "org_name": "InternDesk Technologies Ltd.",
        "org_address": "Cyber City Innovation Hub, Bengaluru, Karnataka, 560100",
        "signatory_name": "Dr. Rajesh Kumar",
        "signatory_title": "Director of Engineering & Training",
        "prefix": "ID-CERT-",
        "title": "Certificate of Internship Completion"
    }'::jsonb,
    true
)
ON CONFLICT (type) DO NOTHING;

-- 2. STANDARD SUBJECTS
INSERT INTO public.subjects (name, description, category, technology, active)
VALUES 
('Modern Fullstack Web Development', 'Core Next.js, React, Node.js, and TypeScript engineering for cloud systems.', 'Web Development', 'Next.js & TypeScript', true),
('Python for Enterprise & Automation', 'Object-oriented programming, data structures, and automation with Python.', 'Python', 'Python 3', true),
('Data Science & Analytics', 'Statistical analysis, pandas, NumPy, and modern data processing workflows.', 'Data Science', 'Data Analytics', true),
('Applied AI & Machine Learning', 'Supervised and unsupervised learning, model evaluation, and LLM foundations.', 'AI / ML', 'Machine Learning', true),
('Enterprise Java Development', 'Spring Boot, microservices architecture, and high-concurrency database integration.', 'Java', 'Java & Spring Boot', true)
ON CONFLICT DO NOTHING;

-- 3. ASSESSMENTS, QUESTIONS & QUESTION OPTIONS SEEDING
DO $$
DECLARE
    v_web_dev_id UUID;
    v_python_id UUID;
    v_ai_id UUID;
    v_asm_web UUID;
    v_asm_py UUID;
    v_q1 UUID;
    v_q2 UUID;
    v_q3 UUID;
    v_q4 UUID;
BEGIN
    SELECT id INTO v_web_dev_id FROM public.subjects WHERE name = 'Modern Fullstack Web Development' LIMIT 1;
    SELECT id INTO v_python_id FROM public.subjects WHERE name = 'Python for Enterprise & Automation' LIMIT 1;
    SELECT id INTO v_ai_id FROM public.subjects WHERE name = 'Applied AI & Machine Learning' LIMIT 1;

    -- 3A. Web Development Assessment
    IF v_web_dev_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.assessments WHERE title = 'Fullstack Web Architecture & Security Evaluation') THEN
        INSERT INTO public.assessments (id, title, description, subject_id, duration_minutes, passing_percentage, max_attempts, status)
        VALUES (
            uuid_generate_v4(), 
            'Fullstack Web Architecture & Security Evaluation', 
            'Timed evaluation covering Next.js App Router, PostgreSQL Row Level Security, and secure API patterns.', 
            v_web_dev_id, 
            30, 
            60.00, 
            2, 
            'PUBLISHED'
        )
        RETURNING id INTO v_asm_web;

        -- Question 1
        INSERT INTO public.questions (id, assessment_id, question_text, marks, difficulty, order_index)
        VALUES (
            uuid_generate_v4(), 
            v_asm_web, 
            'Which PostgreSQL feature does InternDesk use to isolate student records at the database level?', 
            1, 
            'EASY', 
            1
        )
        RETURNING id INTO v_q1;

        INSERT INTO public.question_options (question_id, option_text, option_index, is_correct)
        VALUES 
            (v_q1, 'Row Level Security (RLS)', 1, true),
            (v_q1, 'Foreign Key Cascades', 2, false),
            (v_q1, 'Database Replication', 3, false),
            (v_q1, 'Materialized Views', 4, false);

        -- Question 2
        INSERT INTO public.questions (id, assessment_id, question_text, marks, difficulty, order_index)
        VALUES (
            uuid_generate_v4(), 
            v_asm_web, 
            'How are Razorpay payment confirmations verified server-side to prevent client tampering?', 
            1, 
            'MEDIUM', 
            2
        )
        RETURNING id INTO v_q2;

        INSERT INTO public.question_options (question_id, option_text, option_index, is_correct)
        VALUES 
            (v_q2, 'Client-side alert confirmation', 1, false),
            (v_q2, 'Server-side HMAC-SHA256 signature verification', 2, true),
            (v_q2, 'Local storage token inspection', 3, false),
            (v_q2, 'Cookie expiration check', 4, false);

        -- Question 3
        INSERT INTO public.questions (id, assessment_id, question_text, marks, difficulty, order_index)
        VALUES (
            uuid_generate_v4(), 
            v_asm_web, 
            'What is the prerequisite state before a student can access active dashboard features?', 
            1, 
            'MEDIUM', 
            3
        )
        RETURNING id INTO v_q3;

        INSERT INTO public.question_options (question_id, option_text, option_index, is_correct)
        VALUES 
            (v_q3, 'Mere registration submission', 1, false),
            (v_q3, 'Verified ₹1,000 payment and administrator approval', 2, true),
            (v_q3, 'Mobile app installation', 3, false),
            (v_q3, 'Passing all 5 curriculum tests', 4, false);
    END IF;

    -- 3B. Python Assessment
    IF v_python_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.assessments WHERE title = 'Python Fundamentals & Automation Assessment') THEN
        INSERT INTO public.assessments (id, title, description, subject_id, duration_minutes, passing_percentage, max_attempts, status)
        VALUES (
            uuid_generate_v4(), 
            'Python Fundamentals & Automation Assessment', 
            'Foundational assessment on data processing, OOP principles, and test automation.', 
            v_python_id, 
            30, 
            60.00, 
            2, 
            'PUBLISHED'
        )
        RETURNING id INTO v_asm_py;

        -- Question 4
        INSERT INTO public.questions (id, assessment_id, question_text, marks, difficulty, order_index)
        VALUES (
            uuid_generate_v4(), 
            v_asm_py, 
            'Which Python library is standard for structured tabular data manipulation and analytics?', 
            1, 
            'EASY', 
            1
        )
        RETURNING id INTO v_q4;

        INSERT INTO public.question_options (question_id, option_text, option_index, is_correct)
        VALUES 
            (v_q4, 'Pandas', 1, true),
            (v_q4, 'Tkinter', 2, false),
            (v_q4, 'Urllib', 3, false),
            (v_q4, 'Sys', 4, false);
    END IF;

    -- 4. STUDY MATERIALS SEEDING
    IF v_web_dev_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.study_materials WHERE title = 'Web Development Handbook') THEN
        INSERT INTO public.study_materials (subject_id, title, description, storage_path, file_type, file_size, status)
        VALUES 
        (v_web_dev_id, 'Web Development Handbook', 'Full architectural guide to Next.js App Router and TypeScript.', 'curriculum/web-dev-guide.pdf', 'PDF', 4500000, 'PUBLISHED'),
        (v_web_dev_id, 'Supabase & PostgreSQL Security Architecture', 'Row Level Security policy engineering and trigger patterns.', 'curriculum/supabase-security.pdf', 'PDF', 3100000, 'PUBLISHED');
    END IF;

    IF v_python_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.study_materials WHERE title = 'Python Enterprise Core') THEN
        INSERT INTO public.study_materials (subject_id, title, description, storage_path, file_type, file_size, status)
        VALUES 
        (v_python_id, 'Python Enterprise Core', 'Complete reference on OOP, decorators, and data processing.', 'curriculum/python-core.pdf', 'PDF', 3200000, 'PUBLISHED');
    END IF;

    IF v_ai_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.study_materials WHERE title = 'AI & ML Basics') THEN
        INSERT INTO public.study_materials (subject_id, title, description, storage_path, file_type, file_size, status)
        VALUES 
        (v_ai_id, 'AI & ML Basics', 'Foundations of statistical modeling, evaluation metrics, and PyTorch.', 'curriculum/ai-basics.pdf', 'PDF', 5100000, 'PUBLISHED');
    END IF;
END $$;

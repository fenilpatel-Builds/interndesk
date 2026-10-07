-- ==============================================================================
-- InternDesk: Master Seed Data
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

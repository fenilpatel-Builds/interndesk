# InternDesk — Single Institute Student Activity Management System
## Edition: Akash Technolabs Dedicated Enterprise Portal

InternDesk is a production-ready, full-stack **Single Institute Student Activity Management System** built exclusively for **Akash Technolabs Private Limited** (`https://akashtechnolabs.com/`) to manage students, academic departments, project practicum activities, daily work submissions, attendance sessions, and verifiable credentials.

---

## 1. System Architecture & Features

- **Single Central Institute Identity**:
  - One central institute configuration (`src/lib/institute/config.ts`) with zero multi-tenant or organization switching complexity.
  - Pre-configured departments: Computer Science & Engineering (CSE), Information Technology (IT), Artificial Intelligence & Machine Learning (AIML), Data Science (DS), Cloud Computing & DevOps (CLOUD).
  - Central student and activity database with strict Row Level Security (RLS).
- **100% Free Registration Policy**:
  - Completely free to register and use. Zero payment gateways, zero course fees, and zero checkout mechanisms.
- **Strict Role-Based Access Control (RBAC)**:
  - **Institute Super Admin / Primary Admin**: Akash Padhiyar (CEO) (`akash@akashtechnolabs.com`).
  - **Institute Administrators**: Full oversight over student accounts, approvals, activities, and reports.
  - **Faculty / Mentors / Activity Reviewers**: Evaluate student submissions, provide written feedback, and score practicums.
  - **Students**: Register with Student ID, view assigned activities, submit project reports & code repositories, track attendance, and earn verified certificates.
  - Server-side route authorization enforced in `src/proxy.ts` and `src/lib/auth/actions.ts`.
- **Complete Authentication & Governance Routes**:
  - `/login`: Password or 6-digit Resend OTP sign-in with 1-click test persona quick-fills.
  - `/register`: Multi-step student registration with Student ID, academic department, and email verification.
  - `/verify-email`: Dedicated email verification portal with auto-fill test assistant.
  - `/forgot-password`: Account recovery and verification dispatch via Resend.
  - `/reset-password`: Token/OTP-based password update with live validation.
  - `/pending-approval`: Dedicated student registration verification gate.
  - `/unauthorized`: 403 Forbidden screen intercepting unauthorized role access.
- **Activity & Submission Workflow**:
  - Activity creation with instructions, department targeting, deadlines, and score metrics.
  - Student report submission with GitHub repository / demo URLs.
  - Faculty evaluation modal with status toggle (`APPROVED`, `REJECTED`, `NEEDS_REVISION`), points, and feedback.
  - Sanitized CSV export immune to spreadsheet formula injection attacks.
- **Transactional Emails via Resend**:
  - Official Akash Technolabs HTML templates for OTP codes, welcome messages, approval notifications, activity announcements, and submission evaluation results.

---

## 2. Technology Stack

- **Framework**: Next.js 16.4.0 (App Router, Turbopack, React 19.3.0, TypeScript 5)
- **Styling**: Tailwind CSS v4, Lucide React icons, shadcn/ui component architecture
- **Database & RLS**: Supabase PostgreSQL with local disk fallback cache
- **Authentication**: Supabase Auth + Cryptographic HMAC session tokens
- **Email Delivery**: Resend REST API (Primary) + EmailJS / SMTP fallbacks
- **Validation**: Zod 4 schemas with domain whitelisting
- **Testing**: Vitest 5.0.3 (10 test suites, 100 passing tests)

---

## 3. Demo Credentials

| Role | Name | Email | Password | Target Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Admin (CEO)** | **Akash Padhiyar** | `akash@akashtechnolabs.com` | `Akash@2026` | `/admin/dashboard` |
| **Student Intern (AI/ML)** | **Fenil Patel** | `fenil.patel@akashtechnolabs.com` | `Fenil@2026` | `/student/dashboard` |
| **Student Intern (Cloud)** | **Priya Sharma** | `priya.sharma@akashtechnolabs.com` | `Priya@2026` | `/student/dashboard` |
| **Student Intern (Fullstack)**| **Harshit Mehta** | `harshit.mehta@akashtechnolabs.com` | `Harshit@2026` | `/student/dashboard` |

---

## 4. Quick Start & Development

### Installation
```bash
# Clone repository
git clone https://github.com/fenilpatel-Builds/interndesk.git
cd interndesk

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Run Locally
```bash
# Start Next.js development server
npm run dev

# Open browser at http://localhost:3000
```

### Run Automated Tests
```bash
# Run Vitest test suite
npm test -- --run

# Run TypeScript compilation check
npx tsc --noEmit
```

---

## 5. Database Migration

The Single Institute Edition schema and RLS policies are located at:
`supabase/migrations/20261027_000001_single_institute_edition.sql`

It provisions:
- `departments` & `academic_programs`
- `activities` & `activity_submissions`
- `user_roles`
- Row Level Security (RLS) policies ensuring students only access their own submissions while administrators possess institute-wide oversight.

---

## 6. Security Boundaries

- **Zero Client Trust**: All user roles, student identifiers, and submission status changes are verified on the server.
- **Formula Injection Shield**: CSV exports sanitize leading `=`, `+`, `-`, and `@` characters.
- **Rate-Limited OTP Engine**: 6-digit codes expire in 10 minutes with maximum 5 attempts.
- **Zero Real Secrets in Git**: Sensitive service-role keys and email credentials reside strictly in `.env.local`.

---

© 2026 Akash Technolabs Private Limited. All Rights Reserved.

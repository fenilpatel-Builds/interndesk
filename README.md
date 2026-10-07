# InternDesk — Master Development Specification

## 0. Project Identity
- **Name:** InternDesk
- **Tagline:** Learn • Work • Grow
- **Headline:** Your Internship Journey, Simplified.
- **Copy:** Register, learn, work, track your progress, complete assessments, and get your internship documents — all in one place.
- **Roles:** `ADMIN`, `STUDENT`

## Tech Stack
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS, modern responsive design system
- **Backend/Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (Email OTP / Magic link / Session handling)
- **Payment Gateway:** Razorpay (₹1,000 fee server-verified via webhook/signature)
- **Testing:** Vitest
- **Validation:** Zod schemas
- **Icons:** Lucide React

## Development Workflow
Follow the 18 Phases strictly in dependency order, using `TASK_TRACKER.md` to track each task.

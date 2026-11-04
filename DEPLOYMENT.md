# Akash Technolabs — InternDesk Production Deployment Guide

This guide details the complete, step-by-step procedure to deploy the Akash Technolabs Student Activity & Practicum Portal to production across various hosting providers (**Vercel**, **Railway**, **Render**, **Docker / VPS**).

---

## 1. Production Architecture Overview

- **Framework**: Next.js 16 (App Router + Turbopack + Standalone Output)
- **Runtime**: Node.js 20+ LTS
- **Security**:
  - Zero-Trust Proxy & Server-Side RBAC (`src/proxy.ts`, server layouts)
  - HSTS, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Permissions-Policy
  - Cryptographic HMAC session cookies & SHA-256 verification codes
  - Serverless-resilient data persistence layer (`src/lib/data/storage-path.ts`)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies

---

## 2. Production Environment Variables Checklist

Configure these environment variables in your hosting provider's dashboard:

| Variable | Description | Example / Default |
|---|---|---|
| `NODE_ENV` | Application environment | `production` |
| `NEXT_PUBLIC_APP_NAME` | Portal Display Title | `Akash Technolabs — Student Activity & Practicum Portal` |
| `NEXT_PUBLIC_APP_URL` | Your live custom production domain | `https://portal.akashtechnolabs.com` |
| `PRIMARY_ADMIN_EMAIL` | Whitelisted executive administrator | `fenil8160@gmail.com` |
| `ALLOWED_INSTITUTE_EMAIL_DOMAINS` | Allowed registration domains | `akashtechnolabs.com,gmail.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Service Role Key (Server-only) | `eyJhbGciOi...` |

### Optional: Transactional Email OTP Delivery
| Variable | Description | Example |
|---|---|---|
| `SMTP_HOST` | Gmail / Host SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | Email username | `info@akashtechnolabs.com` |
| `SMTP_PASS` | Google App Password (16 chars) | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Sender display name | `Akash Technolabs <info@akashtechnolabs.com>` |
| `EMAILJS_SERVICE_ID` | EmailJS Service ID (Alternative) | `service_yjkjz93` |
| `EMAILJS_PUBLIC_KEY` | EmailJS Public Key | `zIi0geqydH-23S8nQ` |
| `RESEND_API_KEY` | Resend API Key (Alternative) | `re_...` |

---

## 3. Database Setup (Supabase)

If utilizing Supabase for persistent PostgreSQL storage:
1. Log in to [Supabase Console](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor**.
3. Run the migrations located in the `/supabase/migrations/` folder in order:
   - `20261007_000001_initial_schema.sql`
   - `20261007_000002_rls_policies.sql`
   - `20261027_000001_single_institute_edition.sql`
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key** into your hosting dashboard.

---

## 4. Hosting Option A: Vercel (Recommended & Easiest)

Vercel provides native zero-configuration hosting for Next.js 16.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository `InternDesk`.
4. Vercel automatically detects Next.js.
5. In **Environment Variables**, paste the keys from Section 2.
6. Click **Deploy**.
7. Once deployed:
   - Go to **Settings > Domains** to attach your custom domain (e.g. `portal.akashtechnolabs.com`).
   - Add the CNAME / A DNS records provided by Vercel in your domain registrar (GoDaddy, Cloudflare, Namecheap).

---

## 5. Hosting Option B: Railway / Render (Containerized)

Railway and Render support automatic deployment via Git using our optimized multi-stage `Dockerfile`.

### Steps:
1. Connect your repository in **Railway** or **Render**.
2. Choose **Docker** as the runtime (it will automatically use the root `Dockerfile`).
3. Add the environment variables from Section 2.
4. Set the Healthcheck path to `/login` or `/api/auth/me`.
5. Deploy.

---

## 6. Hosting Option C: Docker & Self-Hosted VPS (Ubuntu / Debian / AWS EC2)

For deploying to your own Virtual Private Server:

### 1. Install Docker & Docker Compose:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Clone & Launch:
```bash
git clone https://github.com/your-org/InternDesk.git
cd InternDesk
cp .env.example .env.production
nano .env.production # Fill in your domain & keys
docker compose up -d --build
```

### 3. Verify Container Status:
```bash
docker ps
# akash-intern-desk running on port 3000
```

---

## 7. Security & Pre-Launch Verification

Before going live with real students:
1. **Admin Whitelist**: Verify that only authorized admin emails are in `src/lib/auth/admin-whitelist.ts` (e.g. `fenil8160@gmail.com`).
2. **Access Control**: Confirm that visiting `/admin/dashboard` in Incognito / Guest mode redirects to `/admin/login`.
3. **Student Isolation**: Confirm that students logging in at `/login` only see their own assigned tasks and documents.
4. **Offer Letter Approval**: Confirm that requested offer letters are marked `PENDING_APPROVAL` and only unlock after admin approval in `/admin/documents`.


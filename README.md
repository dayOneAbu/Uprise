# UPrise

A lightweight, reputation-first internship platform built for the African tech ecosystem — verified merit, not prestige.

## 🌍 The Mission

In Africa, the "Trust Gap" is the biggest hurdle to employment. Thousands of brilliant students from rural or less-known universities are ignored because HR managers rely on "prestige" rather than "proof."

**UPrise** levels the playing field. Using an Upwork-inspired Reputation Engine and AI-powered vetting, we replace biased CV-screening with **verifiable merit.**

## 🛠️ The Tech Stack

Built for speed, type-safety, and scalability:

- **Framework**: T3 Stack (Next.js 15, TypeScript, tRPC)
- **Auth**: Better Auth (Secure Session Management)
- **Database**: Turso (Edge-compatible SQLite)
- **ORM**: Prisma (Hardened Schema with Audit Logs)
- **AI Engine**: Google Gemini (Automated Grading & Plagiarism Detection)
- **Styling**: Tailwind CSS

## 🚀 Key Features

- **AI-Vetted Skill Sprints**: Candidates don't submit CVs; they solve real-world tasks graded instantly by AI.
- **Upwork-Lite Reputation Engine**: Features a **Job Success Score (JSS)** calculated from both public ratings and hidden private feedback.
- **Blind Recruitment**: Employers see scores and skills before names/photos to eliminate unconscious bias.
- **AI Fraud Protection**: Automated detection for unedited LLM-generated submissions.
- **African Context**: Built to be lightweight, offline-ready, and mobile-first for areas with fluctuating connectivity.

## 📊 Database Architecture

The system utilizes a denormalized **Reputation Engine** schema:

- **Users & Profiles**: Separated for performance and data integrity.
- **Contracts**: Tracks the full lifecycle from Hire to Completion.
- **Dual-Review System**: Captures public feedback and private "Trust Scores."
- **AI Logs**: Full auditability of AI tokens, latency, and raw responses.


Live demo

https://uprise-africa.vercel.app/

Folder structure (high-level)

- 📁 `app` — Next.js app routes and pages (app router)
- 📁 `src`
	- 🧩 `_components` — UI pages and dashboards
	- 🧭 `admin`, `candidate`, `employer` — role-specific flows
	- 🧰 `components` — shared UI components
	- 📚 `lib` — services and helpers (e.g. `ai-service.ts`, `auth-client.ts`)
	- 🧪 `trpc` — client/server tRPC setup
	- 🗄️ `server` — server adapters, API and auth helpers
- 📁 `prisma` — schema, migrations, and seed scripts
- 📁 `public` — static assets
- 📄 Project configs: `package.json`, `tsconfig.json`, `next.config.js`

How to run (local dev)

1. Clone: `git clone <repo>`
2. Install: `npm install`
3. Copy env: create a `.env` with `DATABASE_URL` and any AI keys (e.g. `GEMINI_API_KEY`).
4. Apply schema and seed (if needed):
	 - `npx prisma db push`
	 - If seeds exist: `npx prisma db seed` or `node prisma/seed.ts`
5. Start dev server: `npm run dev`

Using the app (short guide)

- Sign up / Sign in: use the onboarding flows under `/onboarding` for employers and candidates.
- Candidates: complete AI-vetted tasks to build skills and Job Success Score (JSS).
- Employers: create jobs, review blinded candidate scores, and invite for interviews.
- Admins: manage users, view AI logs, and moderate content from the admin dashboard.

Demo accounts

These demo accounts are created by `prisma/seed.ts` when you seed the database.

- **Employer:** employer@uprise.demo / 123456789
- **Candidate:** candidate@uprise.demo / 123456789

Run the seed script to recreate these accounts:

```bash
npx prisma db push
node prisma/seed.ts
```

Notes

- This README is intentionally brief. See the source files under `src/` and `prisma/` for implementation details.
- If you want, I can add a more detailed developer setup, environment variable list, or CI instructions.


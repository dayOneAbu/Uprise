# UPrise

**The Reputation-First Internship Platform for the African Tech Ecosystem.**

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

## 🏃 How to Run

1. Clone the repo.
2. Run `npm install`.
3. Set up your `.env` with `DATABASE_URL` (Turso/SQLite) and `GEMINI_API_KEY`.
4. Push the schema: `npx prisma db push`.
5. Start dev: `npm run dev`.

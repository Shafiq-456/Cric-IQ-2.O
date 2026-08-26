# 🏏 CricIQ® 2.0 — The Future of Cricket Intelligence

<p align="center">
  <img src="public/cricket-ball.png" alt="CricIQ Emblem" width="120" />
</p>

<p align="center">
  <b>An AI-powered cricket intelligence platform built for precision analytics, player comparisons, match predictions, and real-time statistics.</b>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#%EF%B8%8F-environment-configuration">Environment Setup</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## ✨ Key Features

### 🔐 Real Firebase Google Authentication & Guest Mode
- Seamless **Google OAuth popup authentication** powered by Firebase Web Modular SDK v12.
- **Guest Access Mode** allowing instant exploration without sign-in barrier.

### 🛡️ Per-User Data Isolation
- **Strict per-user data boundaries**: Every authenticated user gets an isolated dashboard workspace keyed by their unique Firebase UID.
- New users start with a clean workspace (0 initial queries/saved players) while accessing shared global cricket statistics.

### 🧠 Advanced AI Engine (Groq LLM)
- Natural language cricket query processing powered by Groq's high-speed LLM inference.
- Multi-turn conversation capability, head-to-head tactical analysis, statistical breakdown, and predictive match modeling.

### 📊 Real-Time Analytics & Visualizations
- Interactive performance trends (runs, averages, strike rates) powered by **Recharts**.
- Live match trackers, head-to-head player comparisons across formats, and trending player insights.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Glassmorphism & Custom Design Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (Neon / Supabase / Railway)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) (Google OAuth)
- **AI / LLM Provider**: [Groq API](https://groq.com/) (`openai/gpt-oss-120b`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm**
- A **PostgreSQL** database URL (see [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) — all have generous free tiers)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shafiq-456/Cric-IQ-2.O.git
   cd Cric-IQ-2.O
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and fill in all values.
   ```bash
   cp .env.example .env
   ```
   Set `DATABASE_URL` to your PostgreSQL connection string, e.g.:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

4. **Generate Prisma Client & Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🚀 Netlify Deployment

1. Push this repository to GitHub.
2. Connect the repository to [Netlify](https://netlify.com).
3. Set the following **Environment Variables** in Netlify → Site settings → Environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq AI API key |
| `CRICAPI_KEY` | Free cricket data API key (cricapi.com) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web config |

4. After deploying, run the database migration once:
   ```bash
   # From local machine with DATABASE_URL set to your production DB
   npx prisma db push
   ```
5. Add your Netlify domain to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

> **Note**: For local Firebase authentication to work, ensure `localhost` is added to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## 🏗️ Architecture & Data Ownership

```
├── prisma/
│   └── schema.prisma        # Database schema (User, SavedPlayer, UserActivity, RecentSearch)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/        # Groq AI chat endpoint
│   │   │   └── user/        # User sync & stats APIs (token-verified)
│   │   ├── layout.tsx       # Root layout & global metadata
│   │   └── page.tsx         # Main app router & view state management
│   ├── components/
│   │   ├── analytics/       # Analytics dashboard page
│   │   ├── auth/            # LoginPage & Google Auth modal
│   │   ├── chat/            # AI Intelligence Chat page
│   │   ├── compare/         # Head-to-Head player comparison
│   │   ├── dashboard/       # Main user dashboard page
│   │   ├── intro/           # 3D canvas intro animation
│   │   ├── landing/         # Landing hero page
│   │   ├── matches/         # Match schedule & live scores
│   │   ├── players/         # Player search & explorer
│   │   └── settings/        # Preferences & user settings
│   ├── contexts/
│   │   └── FirebaseAuthContext.tsx # Firebase Auth & ID Token sync provider
│   ├── lib/
│   │   ├── db.ts            # Prisma client instance
│   │   ├── firebase.ts      # Client Firebase init
│   │   └── firebaseAdmin.ts # Server token verification
│   └── store/
│       └── useAppStore.ts   # Zustand app state store
```

---

## 🔒 Security

- All API routes handling user-specific records (`/api/user/*`) verify the client's **Firebase ID Token** before performing database queries.
- `GROQ_API_KEY` is strictly server-bound to prevent client bundle leakage.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

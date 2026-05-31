# FounderOps AI Assistant

A production-quality MVP web app to help solo founders manage startup workflow by turning inbound messages and notes into structured actions.

## Features

- **AI-Powered Inbox** — Paste any inbound message (email, DM, form response) and get AI categorization, priority scoring, and a suggested action
- **Lead Tracker** — Track leads through pipeline stages (new → contacted → qualified → proposal → closed)
- **Task Manager** — Create tasks with priority levels and due dates, move through open/in-progress/done
- **Notes** — Capture founder notes and ideas with tag support
- **Dashboard** — Command center showing live stats across all modules
- **Auth** — Magic link login via Supabase (no passwords)

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Magic Link) |
| AI | OpenAI GPT-4o |
| Deployment | Vercel |

## Project Structure

```
founderops-ai-assistant/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── layout.tsx         # Sidebar layout wrapper
│   │   ├── dashboard/         # Dashboard overview
│   │   ├── inbox/             # Inbox + AI analysis
│   │   ├── leads/             # Lead pipeline
│   │   ├── tasks/             # Task manager
│   │   └── notes/             # Notes
│   ├── api/analyze/           # AI analyze API route
│   ├── auth/
│   │   ├── login/             # Magic link login page
│   │   └── callback/          # Auth callback handler
│   ├── components/
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Root redirect to /dashboard
├── lib/
│   ├── ai/analyze.ts          # OpenAI analysis logic
│   ├── actions/               # Server actions
│   │   ├── inbox.ts
│   │   ├── leads.ts
│   │   ├── tasks.ts
│   │   ├── notes.ts
│   │   └── dashboard.ts
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   └── server.ts          # Server client
│   └── validations.ts         # Zod schemas
├── types/
│   ├── index.ts               # App types
│   └── database.ts            # Supabase DB types
├── middleware.ts               # Auth session middleware
├── .env.example               # Environment variables template
└── README.md
```

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Nivii0613/founderops-ai-assistant.git
cd founderops-ai-assistant
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL in `tsconfig.seed.json` (or your migration file) to create tables
3. Copy your project URL and anon key

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your email.

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the same environment variables in your Vercel project settings.

**Important:** In Supabase → Authentication → URL Configuration, add your Vercel production URL to:
- Site URL
- Redirect URLs (e.g. `https://your-app.vercel.app/auth/callback`)

## Database Tables

The app uses 4 main tables in Supabase:

- `inbox_items` — inbound messages with AI analysis fields
- `leads` — lead records with stage and follow-up tracking
- `tasks` — tasks with priority, status, and due dates
- `notes` — founder notes with tags array

All tables have `user_id` with RLS (Row Level Security) policies so each user only sees their own data.

## Usage

1. **Sign in** at `/auth/login` with your email (magic link)
2. **Inbox** — Paste any message → click **Analyze** to get AI categorization + priority + suggested action
3. **Leads** — Add leads with source context, update stages as you progress
4. **Tasks** — Create tasks, set priority + due date, mark in progress or done
5. **Notes** — Capture founder notes with tags for easy reference
6. **Dashboard** — See all stats at a glance

## License

MIT

# PUP Bataan Integrated Learning Management System (LMS)

Web-based LMS built with Next.js App Router, Tailwind CSS, and Supabase.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Deployment target: Vercel

## Features

- Role-based authentication for Student, Faculty, and Admin
- Dashboard with greeting, active courses, announcements, and upcoming deadlines
- Course system with code-based join flow
- Course page tabs: Stream, Classwork, People
- Calendar page with a simple month view for deadlines
- Assignment workflow with file upload/text submission, grading, and feedback
- Announcement posting and basic comments
- Supabase Storage upload/download using signed URLs
- Dark mode toggle with persisted preference

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env.local
```

Fill values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Apply database schema in Supabase SQL editor:

- Run the script from `supabase/schema.sql`

4. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables in Vercel project settings.
4. Deploy.

## Notes

- Storage bucket expected by app: `course-files`
- All core data access is enforced with Supabase Row Level Security policies from schema
- Next.js request routing uses `proxy.ts` instead of the deprecated `middleware.ts` convention

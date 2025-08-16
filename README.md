# GradeAssist

An AI-powered grading assistant for teachers to efficiently grade papers, manage classes, and track student progress.

## Features

- **Class Management**: Create and manage multiple classes with student rosters
- **Quick Grade**: Rapidly grade multiple choice assignments with answer keys
- **Essay Assistant**: AI-powered essay grading with customizable rubrics
- **Import/Export**: Bulk import students via CSV and export grades
- **Dashboard**: Track assignments, submissions, and class statistics

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Environment Variables

To deploy this application on Vercel, you need to set up the following environment variables:

1. Go to your [Vercel project settings](https://vercel.com/dashboard)
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can get these values from your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase/schema.sql` to create all necessary tables
4. Copy your project URL and anon key to use as environment variables

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Mvula88/gradeassist.git
cd gradeassist
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deploy on Vercel

The easiest way to deploy GradeAssist is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mvula88/gradeassist)

Remember to add your environment variables in the Vercel dashboard after deployment.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## License

MIT
# Jobbie v2

A modern job board application built with Next.js, React, and Supabase.

## Features

- Job posting and browsing
- User authentication and profiles  
- Job application management
- Dashboard for job management
- Responsive design

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI components

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure Supabase:
   ```bash
   npm run supabase:start
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3010](http://localhost:3010)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Deployment

The application can be deployed to Vercel or any Node.js hosting platform.

## Deploying to Vercel

You can reuse the same Supabase instance you already have. This app only needs the public Supabase URL and Anon key.

Required env vars (set for Production and Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You can copy these from your existing project (Supabase Dashboard → Project Settings → API), or from another Vercel project that already uses this Supabase instance.

### Option A — Vercel Dashboard (recommended)

1) Import the repo
   - Go to Vercel → New Project → Import your Git repo for this project.
   - Framework preset: Next.js (detected automatically).
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

2) Set Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add these in both Production and Preview environments.

3) Deploy
   - Click Deploy and wait for the build to finish.

4) Post-deploy (optional)
   - If you use OAuth providers later, add your Vercel domain(s) to Supabase → Authentication → URL Configuration (Redirect URLs).

### Option B — Vercel CLI (from WSL)

Prereqs: Node 18+ and `npm i -g vercel`.

Link and deploy the project:

```bash
# In the project root
vercel link
vercel
```

Add env vars (repeat for Preview/Production as needed):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

If you already have a working Vercel project (e.g., another repo using the same Supabase):

```bash
# Pull env from the existing project into a local file
vercel env pull .env.vercel --project <existing-project-name>

# Use the values to add to this new project
# (You’ll be prompted for each value)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Finally, trigger a deployment:

```bash
vercel --prod
```

### Notes

- `vercel.json` pins functions to Node.js 22 and region `iad1`. You can change `regions` to be closer to your users or your Supabase region.
- This project uses only the public anon key on the server via RLS-secured policies. Don’t set your Supabase service role key in Vercel unless you introduce admin/server tasks that need it.
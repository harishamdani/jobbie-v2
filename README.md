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
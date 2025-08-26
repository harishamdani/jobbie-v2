# JobBoard

A full-stack job board application built with Next.js and Supabase, where companies can post jobs and users can browse and apply for them.

## Features

- Authentication with user registration and login
- Job posting, editing, and deletion for authenticated users
- Public job browsing with filtering by location and job type
- Job applications with resume upload functionality
- User dashboard for managing posted jobs and viewing applications
- Responsive design optimized for mobile and desktop

## Tech Stack

- Frontend: Next.js 15 with App Router
- Backend: Supabase (Database + Authentication + Storage)
- Styling: Tailwind CSS v4 with Radix UI components
- Form Handling: React Hook Form with Zod validation
- Deployment: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd jobboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or use bun for faster installation
   bun install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a new Supabase project at supabase.com
   - Run the SQL commands from `supabase-setup.sql` in your Supabase SQL editor
   - Set up storage policies using `supabase-storage-setup.sql`

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3010

6. **Run Tests (Optional)**
   ```bash
   npm run test:e2e
   ```


### Database Schema

- profiles: User profiles linked to Supabase Auth
- jobs: Job postings with company details  
- applications: Job applications with resume storage
- Storage: Resume files in Supabase Storage

### Authentication Flow

The application uses Supabase Auth with the following flow:
1. Users register/login via Supabase Auth
2. Middleware protects dashboard routes
3. Server-side auth checks for API routes
4. Client-side auth state management

## Approach & Technical Decisions

### Framework Choice
Used Next.js App Router for React patterns and API integration. Added TypeScript for type safety.

### Backend Strategy
Used Supabase for database, authentication, and file storage. Implemented Row Level Security for data access control.

### UI/UX Approach
Built mobile-first responsive layouts. Used Radix UI for accessible components and Tailwind CSS for styling. Added Zod schemas for form validation on client and server.

### State Management
Used React Hook Form for forms and Supabase client for database queries.

## Available Scripts

Development:
```bash
npm run dev              # Start dev server on port 3010
npm run build           # Build for production
npm run start           # Start production server
```

Code Quality:
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run format          # Format with Prettier
```

Testing:
```bash
npm run test:e2e        # Run Playwright tests
npm run test:e2e:ui     # Run tests with UI
npm run test:e2e:headed # Run tests in headed mode
```

Supabase:
```bash
npm run supabase:start  # Start local Supabase
npm run supabase:reset  # Reset local database
npm run supabase:gen-types # Generate TypeScript types
```

## What would you improve if given more time?

### User Interface
- Better loading states and skeleton screens
- Dark mode theme toggle
- Improved mobile navigation
- Image uploads for company logos

### User Experience  
- Job bookmarking and saved searches
- Email notifications for new job postings
- Application status updates (pending, reviewed, rejected)
- Basic job recommendations

### Additional Features
- Company profile pages
- Resume builder tool
- Job posting expiration dates
- Simple analytics dashboard for recruiters

### Code Quality
- Add more comprehensive unit tests
- Add e2e testing with Playwright
- Improve error handling and user feedback
- Code splitting for better performance
- Better TypeScript type coverage

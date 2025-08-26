-- Supabase Database Setup for Job Board
-- Run this script in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Full-Time', 'Part-Time', 'Contract')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- RLS Policies for jobs table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Anyone can view jobs') THEN
    CREATE POLICY "Anyone can view jobs" ON jobs
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Users can create own jobs') THEN
    CREATE POLICY "Users can create own jobs" ON jobs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Users can update own jobs') THEN
    CREATE POLICY "Users can update own jobs" ON jobs
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Users can delete own jobs') THEN
    CREATE POLICY "Users can delete own jobs" ON jobs
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at column
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_jobs ON jobs;
CREATE TRIGGER handle_updated_at_jobs
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_location_idx ON jobs USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS jobs_title_idx ON jobs USING gin(to_tsvector('english', title));

-- Job Application System Migration
-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  cover_letter TEXT,
  resume_url TEXT, -- Supabase Storage URL
  status VARCHAR(50) DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  UNIQUE(job_id, applicant_id), -- One application per user per job
  CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'))
);

-- Add application_count to jobs table for performance
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;

-- Add view_count for analytics
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to update application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET application_count = application_count - 1 WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for application count
DROP TRIGGER IF EXISTS job_application_count_trigger ON job_applications;
CREATE TRIGGER job_application_count_trigger
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Create job views tracking table (for detailed analytics)
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- null for anonymous views
  viewer_ip VARCHAR(45), -- for anonymous tracking
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS trigger AS $$
BEGIN
  UPDATE jobs SET view_count = view_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS job_view_count_trigger ON job_views;
CREATE TRIGGER job_view_count_trigger
  AFTER INSERT ON job_views
  FOR EACH ROW EXECUTE FUNCTION increment_job_view_count();

-- Enable RLS on new tables
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_applications table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'job_applications_select_policy') THEN
    CREATE POLICY "job_applications_select_policy" ON job_applications
      FOR SELECT USING (
        applicant_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM jobs 
          WHERE jobs.id = job_applications.job_id 
          AND jobs.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'job_applications_insert_policy') THEN
    CREATE POLICY "job_applications_insert_policy" ON job_applications
      FOR INSERT WITH CHECK (applicant_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'job_applications_update_policy') THEN
    CREATE POLICY "job_applications_update_policy" ON job_applications
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM jobs 
          WHERE jobs.id = job_applications.job_id 
          AND jobs.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS Policies for job_views table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_views' AND policyname = 'job_views_insert_policy') THEN
    CREATE POLICY "job_views_insert_policy" ON job_views
      FOR INSERT WITH CHECK (true); -- Anyone can create views
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_views' AND policyname = 'job_views_select_policy') THEN
    CREATE POLICY "job_views_select_policy" ON job_views
      FOR SELECT USING (
        viewer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM jobs 
          WHERE jobs.id = job_views.job_id 
          AND jobs.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_applicant_id_idx ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON job_applications(status);
CREATE INDEX IF NOT EXISTS job_applications_applied_at_idx ON job_applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS job_views_job_id_idx ON job_views(job_id);
CREATE INDEX IF NOT EXISTS job_views_viewer_id_idx ON job_views(viewer_id);
CREATE INDEX IF NOT EXISTS job_views_viewed_at_idx ON job_views(viewed_at DESC);

-- Add search optimization index
CREATE INDEX IF NOT EXISTS jobs_search_idx ON jobs USING gin (
  to_tsvector('english', title || ' ' || company_name || ' ' || description)
);

-- Trigger for job applications updated_at
DROP TRIGGER IF EXISTS handle_updated_at_job_applications ON job_applications;
CREATE TRIGGER handle_updated_at_job_applications
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create storage bucket for resumes (run this separately in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
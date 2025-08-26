-- Supabase Storage Setup for Resume Uploads
-- Run this script in your Supabase SQL Editor after running supabase-setup.sql

-- Create storage bucket for resumes (private bucket)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies for resumes bucket
-- Drop existing policies first to ensure they can be recreated if needed
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Job posters can view applicant resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Job posters can view applicant resumes"
ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' 
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE j.user_id = auth.uid()
    AND ja.resume_url LIKE '%' || name || '%'
  )
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
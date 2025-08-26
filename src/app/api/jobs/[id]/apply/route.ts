import { createClient } from '@/lib/supabase-server';
import { jobApplicationSchema } from '@/lib/validations/application';
import { NextResponse } from 'next/server';
import type { NewJobApplication, JobApplicationWithProfile } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: jobId } = await params;
  
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, user_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot apply to your own job' }, { status: 400 });
  }

  const { data: existingApplication } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .single();

  if (existingApplication) {
    return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    
    const applicationData = {
      applicant_name: formData.get('applicant_name') as string,
      applicant_email: formData.get('applicant_email') as string,
      cover_letter: formData.get('cover_letter') as string || undefined,
      resume: formData.get('resume') as File || undefined
    };

    const validation = jobApplicationSchema.safeParse(applicationData);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid form data', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { data: validatedData } = validation;

    let resumeUrl: string | null = null;
    let fileName: string | null = null;
    if (validatedData.resume) {
      const resumeFile = validatedData.resume;
      fileName = `${user.id}/${jobId}/${Date.now()}-${resumeFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Resume upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
      resumeUrl = publicUrl;
    }

    const newApplication: NewJobApplication = {
      job_id: jobId,
      applicant_id: user.id,
      applicant_name: validatedData.applicant_name,
      applicant_email: validatedData.applicant_email,
      cover_letter: validatedData.cover_letter || null,
      resume_url: resumeUrl
    };

    const { data: application, error: insertError } = await supabase
      .from('job_applications')
      .insert(newApplication)
      .select()
      .single();

    if (insertError) {
      console.error('Application insert error:', insertError);
      
      if (resumeUrl && fileName) {
        await supabase.storage
          .from('resumes')
          .remove([fileName]);
      }
      
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      application: {
        id: application.id,
        status: application.status,
        applied_at: application.applied_at
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: jobId } = await params;
  const { data: job } = await supabase
    .from('jobs')
    .select('user_id')
    .eq('id', jobId)
    .single();
    
  if (!job || job.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      profiles:applicant_id (
        full_name,
        email
      )
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }

  return NextResponse.json(applications as JobApplicationWithProfile[]);
}
import { createClient } from '@/lib/supabase-server';
import { applicationStatusUpdateSchema } from '@/lib/validations/application';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: jobId, applicationId } = await params;
  try {
    const body = await request.json();
    const validation = applicationStatusUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid status', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { status } = validation.data;

    const { data: job } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', jobId)
      .single();
      
    if (!job || job.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: application, error } = await supabase
      .from('job_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('job_id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      application: {
        id: application.id,
        status: application.status,
        updated_at: application.updated_at
      }
    });

  } catch (error) {
    console.error('Application status update error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: jobId, applicationId } = await params;
  const { data: application, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs!inner (
        id,
        title,
        company_name,
        user_id
      ),
      profiles:applicant_id (
        full_name,
        email
      )
    `)
    .eq('id', applicationId)
    .eq('job_id', jobId)
    .single();

  if (error || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const isJobOwner = application.jobs.user_id === user.id;
  const isApplicant = application.applicant_id === user.id;

  if (!isJobOwner && !isApplicant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(application);
}
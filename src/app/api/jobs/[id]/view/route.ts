import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NewJobView } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: jobId } = await params;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let existingViewQuery = supabase
      .from('job_views')
      .select('id')
      .eq('job_id', jobId)
      .gt('viewed_at', oneHourAgo);

    if (user) {
      existingViewQuery = existingViewQuery.eq('viewer_id', user.id);
    } else {
      existingViewQuery = existingViewQuery.eq('viewer_ip', ip);
    }

    const { data: existingView } = await existingViewQuery.single();

    if (!existingView) {
      const newView: NewJobView = {
        job_id: jobId,
        viewer_id: user?.id || null,
        viewer_ip: user ? null : ip
      };

      const { error: insertError } = await supabase
        .from('job_views')
        .insert(newView);

      if (insertError) {
        console.error('Failed to record job view:', insertError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Job view tracking error:', error);
    return NextResponse.json({ success: true });
  }
}
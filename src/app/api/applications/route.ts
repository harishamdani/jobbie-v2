import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs (
          id,
          title,
          company_name,
          location,
          job_type,
          created_at
        )
      `)
      .eq('applicant_id', user.id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching user applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    return NextResponse.json(applications);

  } catch (error) {
    console.error('User applications error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
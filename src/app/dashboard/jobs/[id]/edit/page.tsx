import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { EditJobForm } from './edit-job-form';

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id) // Ensure user owns this job
    .single();

  if (error || !job) {
    redirect('/dashboard/jobs');
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Job Posting</CardTitle>
            <CardDescription>
              Update your job listing to keep it current and attract the best candidates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditJobForm job={job} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
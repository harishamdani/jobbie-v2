import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ApplicationsList } from '@/components/applications-list';
import { Building2, MapPin, Users, Calendar } from 'lucide-react';

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, application_count, view_count')
    .eq('id', resolvedParams.id)
    .eq('user_id', session.user.id) // Ensure user owns this job
    .single();

  if (jobError || !job) {
    notFound();
  }

  const { data: applications, error: appsError } = await supabase
    .from('job_applications')
    .select(`
      *,
      profiles:applicant_id (
        full_name,
        email
      )
    `)
    .eq('job_id', resolvedParams.id)
    .order('applied_at', { ascending: false });

  if (appsError) {
    console.error('Error fetching applications:', appsError);
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/jobs" className="hover:text-foreground">
            My Jobs
          </Link>
          <span>/</span>
          <span className="text-foreground">Applications</span>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <Badge variant="secondary">{job.job_type}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/jobs/${job.id}`}>
                    View Public Listing
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/jobs/${job.id}/edit`}>
                    Edit Job
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{job.application_count || 0}</span>
                <span className="text-muted-foreground">
                  Application{(job.application_count || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applications</CardTitle>
                <p className="text-muted-foreground">
                  {(applications?.length || 0) === 0 
                    ? "No applications received yet"
                    : `${applications?.length} candidate${applications?.length !== 1 ? 's' : ''} applied`
                  }
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <ApplicationsList 
                applications={applications}
                jobId={resolvedParams.id}
              />
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  When candidates apply to this position, you&apos;ll see their applications here.
                  Make sure your job posting is compelling to attract qualified candidates.
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/jobs/${job.id}`}>
                    View Job Listing
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
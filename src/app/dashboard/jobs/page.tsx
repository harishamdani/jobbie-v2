import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BuildingIcon } from 'lucide-react';
import DashboardJobsList from '@/components/dashboard-jobs-list';

export default async function DashboardJobsPage() {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, application_count, view_count')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user jobs:', error);
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Job Postings</h1>
            <p className="text-muted-foreground">
              Manage and track your job listings
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              Post New Job
            </Link>
          </Button>
        </div>

        {!jobs || jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <BuildingIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No job postings yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven&apos;t posted any jobs yet. Start by creating your first job posting to attract great candidates.
              </p>
              <Button asChild>
                <Link href="/dashboard/jobs/new">
                  Post Your First Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DashboardJobsList initialJobs={jobs} />
        )}
      </div>
    </div>
  );
}
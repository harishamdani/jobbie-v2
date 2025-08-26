import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JobApplyButton } from '@/components/job-apply-button';
import { JobViewTracker } from '@/components/job-view-tracker';
import { MapPin, Building2, Clock, Users, Eye } from 'lucide-react';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, application_count, view_count')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !job) {
    notFound();
  }

  let hasApplied = false;
  if (user) {
    const { data: application } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', resolvedParams.id)
      .eq('applicant_id', user.id)
      .single();
    
    hasApplied = !!application;
  }

  const isOwnJob = user?.id === job.user_id;

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <JobViewTracker jobId={resolvedParams.id} />
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/jobs">← Back to Jobs</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{job.title}</CardTitle>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
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

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  {job.application_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{job.application_count} application{job.application_count !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {job.view_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.view_count} view{job.view_count !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {job.updated_at && job.updated_at !== job.created_at && (
                    <span>Updated {new Date(job.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <JobApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  companyName={job.company_name}
                  hasApplied={hasApplied}
                  isOwnJob={isOwnJob}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                <div className="prose max-w-none text-foreground">
                  {job.description.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
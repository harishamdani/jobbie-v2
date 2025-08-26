'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon, BuildingIcon, EyeIcon, Users } from 'lucide-react';
import JobActions from '@/components/job-actions';
import Link from 'next/link';
import type { JobWithStats } from '@/lib/types';

interface DashboardJobsListProps {
  initialJobs: JobWithStats[];
}

export default function DashboardJobsList({ initialJobs }: DashboardJobsListProps) {
  const [jobs, setJobs] = useState(initialJobs);

  const handleJobDeleted = (deletedJobId: string) => {
    setJobs(jobs.filter(job => job.id !== deletedJobId));
  };

  return (
    <div className="grid gap-6">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <Badge variant={job.job_type === 'Full-Time' ? 'default' : 'secondary'}>
                    {job.job_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BuildingIcon className="h-4 w-4" />
                    <span className="text-sm">{job.company_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm">
                      Posted {new Date(job.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <JobActions 
                jobId={job.id} 
                jobTitle={job.title}
                onJobDeleted={() => handleJobDeleted(job.id)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-foreground/80 line-clamp-2">
                {job.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{job.view_count || 0} view{(job.view_count || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{job.application_count || 0} application{(job.application_count || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <span>•</span>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  {(job.application_count || 0) > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <Link href={`/dashboard/jobs/${job.id}/applications`}>
                        View Applications
                      </Link>
                    </Button>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(job.updated_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
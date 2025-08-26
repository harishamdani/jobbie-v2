'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  ExternalLink,
  Clock,
  FileText,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface JobApplicationWithJob {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    created_at: string;
  } | null;
}

interface ApplicationHistoryProps {
  applications: JobApplicationWithJob[];
}

export function ApplicationHistory({ applications }: ApplicationHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return '✓';
      case 'rejected': return '✗';
      case 'reviewed': return '👀';
      default: return '⏳';
    }
  };

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No applications yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven&apos;t applied to any jobs yet. Start browsing available positions to find your next opportunity.
        </p>
        <Button asChild>
          <Link href="/jobs">
            Browse Jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const job = application.jobs;
        if (!job) return null;

        return (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(application.status)}
                  >
                    <span className="mr-1">{getStatusIcon(application.status)}</span>
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                </div>
                {application.updated_at !== application.applied_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date(application.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {application.cover_letter && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Cover Letter (Preview)
                  </h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm line-clamp-3">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {application.resume_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={application.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <Link href={`/jobs/${job.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Application ID: {application.id.slice(0, 8)}...
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
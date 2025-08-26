'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Mail, 
  FileText, 
  ExternalLink, 
  User,
  Clock
} from 'lucide-react';
import type { JobApplicationWithProfile } from '@/lib/types';

interface ApplicationsListProps {
  applications: JobApplicationWithProfile[];
  jobId: string;
}

export function ApplicationsList({ applications: initialApplications, jobId }: ApplicationsListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update status');
      }

      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as 'pending' | 'reviewed' | 'accepted' | 'rejected', updated_at: new Date().toISOString() }
            : app
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New';
      case 'reviewed': return 'Reviewed';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {application.applicant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{application.applicant_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${application.applicant_email}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {application.applicant_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
                <Select
                  value={application.status}
                  onValueChange={(value) => handleStatusUpdate(application.id, value)}
                  disabled={updating === application.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.cover_letter && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Cover Letter
                </h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
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
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Full Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Application Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {application.applicant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">{application.applicant_name}</h3>
                          <p className="text-muted-foreground">{application.applicant_email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Applied: {new Date(application.applied_at).toLocaleString()}</span>
                            {application.updated_at !== application.applied_at && (
                              <span>Updated: {new Date(application.updated_at).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div>
                          <h4 className="font-semibold mb-3">Cover Letter</h4>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="whitespace-pre-wrap">{application.cover_letter}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {application.resume_url && (
                          <Button asChild>
                            <a 
                              href={application.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Download Resume
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" asChild>
                          <a href={`mailto:${application.applicant_email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </a>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {application.updated_at !== application.applied_at 
                    ? `Updated ${new Date(application.updated_at).toLocaleDateString()}`
                    : `Applied ${new Date(application.applied_at).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
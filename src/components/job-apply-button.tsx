'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { JobApplicationForm } from '@/components/job-application-form';
import { CheckCircle, Send } from 'lucide-react';

interface JobApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  hasApplied?: boolean;
  isOwnJob?: boolean;
  className?: string;
}

export function JobApplyButton({ 
  jobId, 
  jobTitle, 
  companyName, 
  hasApplied = false,
  isOwnJob = false,
  className 
}: JobApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(hasApplied);

  const handleSuccess = () => {
    setApplicationSubmitted(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (isOwnJob) {
    return null;
  }

  if (applicationSubmitted) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className={className}
        data-testid="application-submitted"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Application Submitted
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className={className} data-testid="apply-button">
          <Send className="w-4 h-4 mr-2" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <JobApplicationForm 
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
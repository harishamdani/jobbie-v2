'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobApplicationSchema, type JobApplicationFormData } from '@/lib/validations/application';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function JobApplicationForm({ 
  jobId, 
  jobTitle, 
  companyName, 
  onSuccess, 
  onCancel 
}: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      applicant_name: '',
      applicant_email: '',
      cover_letter: '',
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      form.setValue('resume', file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue('resume', undefined);
    const fileInput = document.getElementById('resume') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async (data: JobApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('applicant_name', data.applicant_name);
    formData.append('applicant_email', data.applicant_email);
    if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
    if (data.resume) formData.append('resume', data.resume);

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Apply to {jobTitle}</h2>
        <p className="text-muted-foreground">at {companyName}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="applicant_name">Full Name *</Label>
          <Input
            id="applicant_name"
            {...form.register('applicant_name')}
            placeholder="Your full name"
            className="mt-1"
          />
          {form.formState.errors.applicant_name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.applicant_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="applicant_email">Email Address *</Label>
          <Input
            id="applicant_email"
            type="email"
            {...form.register('applicant_email')}
            placeholder="your.email@example.com"
            className="mt-1"
          />
          {form.formState.errors.applicant_email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.applicant_email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="resume">Resume (PDF, DOC, DOCX)</Label>
          <div className="mt-1">
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <div className="text-sm text-muted-foreground mb-2">
                  Drop your resume here or click to browse
                </div>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX up to 5MB
                </div>
              </div>
            )}
          </div>
          {form.formState.errors.resume && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.resume.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="cover_letter">Cover Letter</Label>
          <Textarea
            id="cover_letter"
            {...form.register('cover_letter')}
            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            rows={8}
            className="mt-1 resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {form.formState.errors.cover_letter ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.cover_letter.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Optional, but recommended (minimum 50 characters)
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {form.watch('cover_letter')?.length || 0}/2000
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
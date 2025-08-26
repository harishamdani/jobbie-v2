'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { createJobSchema, CreateJobInput, JOB_TYPES } from '@/lib/validations/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  description: string;
}

interface EditJobFormProps {
  job: Job;
}

export function EditJobForm({ job }: EditJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      job_type: job.job_type as typeof JOB_TYPES[number],
      description: job.description,
    },
  });

  const watchedJobType = watch('job_type');

  const onSubmit = async (data: CreateJobInput) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in to edit this job');
        return;
      }

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)
        .eq('user_id', session.user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push(`/jobs/${job.id}`);
      }, 1500);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <AlertDescription>
          Job updated successfully! Redirecting to job details...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g. Senior Software Engineer"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          {...register('company_name')}
          placeholder="e.g. Acme Corp"
        />
        {errors.company_name && (
          <p className="text-sm text-destructive">{errors.company_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="e.g. San Francisco, CA or Remote"
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_type">Job Type</Label>
        <Select
          value={watchedJobType}
          onValueChange={(value) => setValue('job_type', value as typeof JOB_TYPES[number])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.job_type && (
          <p className="text-sm text-destructive">{errors.job_type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the role, responsibilities, and requirements..."
          className="min-h-[200px]"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Updating Job...' : 'Update Job'}
        </Button>
      </div>
    </form>
  );
}
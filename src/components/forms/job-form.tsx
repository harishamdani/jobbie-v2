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

export function JobForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
  });

  const onSubmit = async (data: CreateJobInput) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in to post a job');
        return;
      }

      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
          ...data,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
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
          Job posted successfully! Redirecting to job details...
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Posting Job...' : 'Post Job'}
      </Button>
    </form>
  );
}
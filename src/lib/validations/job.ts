import { z } from 'zod';

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract'] as const;

export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200, 'Job title cannot exceed 200 characters'),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name cannot exceed 100 characters'),
  description: z.string().min(1, 'Job description is required').max(5000, 'Job description cannot exceed 5000 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location cannot exceed 100 characters'),
  job_type: z.enum(JOB_TYPES, {
    errorMap: () => ({ message: 'Please select a valid job type' })
  })
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export { JOB_TYPES };
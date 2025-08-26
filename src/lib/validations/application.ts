import { z } from 'zod';

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const jobApplicationSchema = z.object({
  applicant_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Name contains invalid characters'),
  
  applicant_email: z.string()
    .email('Invalid email address')
    .max(254, 'Email too long'),
    
  cover_letter: z.string()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(2000, 'Cover letter must not exceed 2000 characters')
    .optional(),
    
  resume: z.instanceof(File, { message: 'Resume file is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), 'Only PDF, DOC, and DOCX files are allowed')
    .optional()
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected'])
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type ApplicationStatusUpdate = z.infer<typeof applicationStatusUpdateSchema>;

export function validateResumeFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only PDF, DOC, and DOCX files are allowed';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB';
  }
  
  return null;
}
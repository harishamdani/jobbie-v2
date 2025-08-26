export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company_name: string;
          description: string;
          location: string;
          job_type: 'Full-Time' | 'Part-Time' | 'Contract';
          application_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company_name: string;
          description: string;
          location: string;
          job_type: 'Full-Time' | 'Part-Time' | 'Contract';
          application_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company_name?: string;
          description?: string;
          location?: string;
          job_type?: 'Full-Time' | 'Part-Time' | 'Contract';
          application_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          applicant_id: string;
          applicant_name: string;
          applicant_email: string;
          cover_letter: string | null;
          resume_url: string | null;
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          applicant_id: string;
          applicant_name: string;
          applicant_email: string;
          cover_letter?: string | null;
          resume_url?: string | null;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          applicant_id?: string;
          applicant_name?: string;
          applicant_email?: string;
          cover_letter?: string | null;
          resume_url?: string | null;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at?: string;
          updated_at?: string;
        };
      };
      job_views: {
        Row: {
          id: string;
          job_id: string;
          viewer_id: string | null;
          viewer_ip: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          viewer_id?: string | null;
          viewer_ip?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          viewer_id?: string | null;
          viewer_ip?: string | null;
          viewed_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type NewJob = Database['public']['Tables']['jobs']['Insert'];
export type UpdateJob = Database['public']['Tables']['jobs']['Update'];

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type NewJobApplication = Database['public']['Tables']['job_applications']['Insert'];
export type UpdateJobApplication = Database['public']['Tables']['job_applications']['Update'];

export type JobView = Database['public']['Tables']['job_views']['Row'];
export type NewJobView = Database['public']['Tables']['job_views']['Insert'];

export interface JobWithStats extends Job {
  user_has_applied?: boolean;
}

export interface JobApplicationWithProfile extends JobApplication {
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

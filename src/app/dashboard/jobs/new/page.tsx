import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JobForm } from '@/components/forms/job-form';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewJobPage() {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post a New Job</CardTitle>
            <CardDescription>
              Fill out the form below to create a new job posting and start attracting candidates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
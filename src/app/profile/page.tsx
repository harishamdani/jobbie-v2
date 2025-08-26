import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';
import { ApplicationHistory } from '@/components/application-history';

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs (
        id,
        title,
        company_name,
        location,
        job_type,
        created_at
      )
    `)
    .eq('applicant_id', session.user.id)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your application history
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="applications">
              My Applications 
              {applications && applications.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {applications.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Application History</CardTitle>
                <p className="text-muted-foreground">
                  Track all your job applications and their current status
                </p>
              </CardHeader>
              <CardContent>
                <ApplicationHistory applications={applications || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
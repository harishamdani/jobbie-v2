'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface JobActionsProps {
  jobId: string;
  jobTitle: string;
  onJobDeleted: () => void;
}

export default function JobActions({ jobId, jobTitle, onJobDeleted }: JobActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      } else {
        setIsDialogOpen(false);
        onJobDeleted();
        alert('Job deleted successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/jobs/${jobId}`}>
          <EyeIcon className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/jobs/${jobId}/edit`}>
          <EditIcon className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Link>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{jobTitle}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
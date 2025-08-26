'use client';

import { useEffect } from 'react';

interface JobViewTrackerProps {
  jobId: string;
}

export function JobViewTracker({ jobId }: JobViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/jobs/${jobId}/view`, { method: 'POST' });
      } catch (error) {
        console.debug('View tracking failed:', error);
      }
    };

    trackView();
  }, [jobId]);

  return null;
}
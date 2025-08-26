'use client';

import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  created_at: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="font-medium">{job.company_name}</div>
            <div className="flex items-center justify-between">
              <span>{job.location}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {job.job_type}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Posted {formatDate(job.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const from = (page - 1) * itemsPerPage;
  
  const jobTypes = ['Full-Time', 'Part-Time', 'Contract'];

  const fetchJobs = useCallback(async (location = '', jobType = '', currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const currentFrom = (currentPage - 1) * itemsPerPage;
      const currentTo = currentFrom + itemsPerPage - 1;
      
      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, job_type, created_at')
        .order('created_at', { ascending: false });
      
      let countQuery = supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true });
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
        countQuery = countQuery.ilike('location', `%${location}%`);
      }
      
      if (jobType && jobType !== 'all') {
        query = query.eq('job_type', jobType);
        countQuery = countQuery.eq('job_type', jobType);
      }
      
      query = query.range(currentFrom, currentTo);
      
      const [jobsResponse, totalResponse] = await Promise.all([
        query,
        countQuery
      ]);
      
      if (jobsResponse.error) {
        throw jobsResponse.error;
      }
      
      setJobs(jobsResponse.data || []);
      setTotalJobs(totalResponse.count || 0);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedFetchJobs = useCallback((location: string, jobType: string, currentPage: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchJobs(location, jobType, currentPage);
    }, 300);
  }, [fetchJobs]);
  
  const updateURL = useCallback((location: string, jobType: string, currentPage: number) => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (jobType && jobType !== 'all') params.set('type', jobType);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `/jobs?${params.toString()}` : '/jobs';
    router.push(newURL, { scroll: false });
  }, [router]);
  
  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    const newPage = 1;
    updateURL(value, jobTypeFilter, newPage);
    debouncedFetchJobs(value, jobTypeFilter, newPage);
  };
  
  const handleJobTypeChange = (value: string) => {
    setJobTypeFilter(value);
    const newPage = 1;
    updateURL(locationFilter, value, newPage);
    debouncedFetchJobs(locationFilter, value, newPage);
  };
  
  const clearFilters = () => {
    setLocationFilter('');
    setJobTypeFilter('');
    updateURL('', '', 1);
    fetchJobs('', '', 1);
  };
  
  const handlePageChange = (newPage: number) => {
    updateURL(locationFilter, jobTypeFilter, newPage);
    fetchJobs(locationFilter, jobTypeFilter, newPage);
  };
  
  useEffect(() => {
    const locationParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || '';
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    
    setLocationFilter(locationParam);
    setJobTypeFilter(typeParam);
    
    fetchJobs(locationParam, typeParam, pageParam);
  }, [searchParams, fetchJobs]);
  
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Jobs</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Listings</h1>
        <p className="text-gray-600">Find your next opportunity</p>
        {!loading && totalJobs > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {from + 1}-{Math.min(from + itemsPerPage, totalJobs)} of {totalJobs} jobs
          </p>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 min-w-0">
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location-filter"
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="job-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <Select value={jobTypeFilter || 'all'} onValueChange={handleJobTypeChange}>
              <SelectTrigger id="job-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(locationFilter || jobTypeFilter) && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              {page > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
              )}
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              
              {page < totalPages && (
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            {locationFilter || jobTypeFilter ? 'No Jobs Found' : 'No Jobs Available'}
          </h2>
          <p className="text-gray-600">
            {locationFilter || jobTypeFilter 
              ? 'Try adjusting your filters to see more results.' 
              : 'Check back later for new opportunities.'}
          </p>
          {(locationFilter || jobTypeFilter) && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
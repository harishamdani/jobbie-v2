import Link from 'next/link';
import { Briefcase, Search, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Briefcase className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Find Your Dream Job
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect with top employers and discover opportunities that match your skills and aspirations. 
            Start your career journey with JobBoard today.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose JobBoard?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Everything you need to find your next opportunity or hire top talent.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Search className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Smart Search
              </h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Find relevant jobs quickly with our intelligent search and filtering system.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Quality Employers
              </h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Connect with verified companies and trusted employers in your industry.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Career Growth
              </h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Track your applications and get insights to accelerate your career progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Join thousands of professionals who have found their dream jobs through JobBoard.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-col sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

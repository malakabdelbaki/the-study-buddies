'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { User } from '@/types/User';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('searchTerm');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setError('Search term is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/user/search', {
          params: { searchTerm },
        });
        setResults(response.data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching search results:', err.message);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {results.length === 0 ? (
        <p>No results found for "{searchTerm}"</p>
      ) : (
        <ul className="space-y-2">
          {results.map((user) => (
            <li key={user._id} className="border p-4 rounded bg-gray-50 shadow-md">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              {user.role === 'student' && (
                <>
                  {user.enrolledCourses && user.enrolledCourses.length > 0 && (
                    <p>
                      <strong>Enrolled Courses:</strong>{' '}
                      {user.enrolledCourses.join(', ')}
                    </p>
                  )}
                  {user.completedCourses && user.completedCourses.length > 0 && (
                    <p>
                      <strong>Completed Courses:</strong>{' '}
                      {user.completedCourses.join(', ')}
                    </p>
                  )}
                </>
              )}
              {user.role === 'instructor' && user.taughtCourses && user.taughtCourses.length > 0 && (
                <p>
                  <strong>Taught Courses:</strong> {user.taughtCourses.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;

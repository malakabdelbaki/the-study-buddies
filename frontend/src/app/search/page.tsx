
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { User } from '@/types/User';
import { Course } from '@/types/Course';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('searchTerm');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]); // Store the courses
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null); // Store the selected course ID

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        setLoggedInUser(response.data);
      } catch (err: any) {
        console.error('Error fetching logged-in user:', err.message);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/user/search/assign'); // Ensure this endpoint fetches courses
        setCourses(response.data); // Assuming the API returns an array of Course objects
      } catch (err: any) {
        console.error('Error fetching courses:', err.message);
        setError('Failed to fetch courses. Please try again.');
      }
    };

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

    fetchLoggedInUser();
    fetchCourses();
    fetchResults();
  }, [searchTerm]);

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/user/search?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });
      alert('User deleted successfully');
      setResults((prevResults) => prevResults.filter((user) => user._id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err.message);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleAssignStudentToCourse = async (studentId: string) => {
    console.log("here it is:"+ studentId)

    if (!selectedCourseId) {
      alert('Please select a course first.');
      return;
    }

    try {
      console.log("here it is:"+ studentId)
      await axios.put(`/api/user/search/assign?courseId=${selectedCourseId}`, {
        studentIds: [studentId],
      });
      alert('Student assigned to course successfully');
    } catch (err: any) {
      console.error('Error assigning student to course:', err.message);
      alert('Failed to assign student to course. Please try again.');
    }
  };

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
                      <strong>Enrolled Courses:</strong> {user.enrolledCourses.join(', ')}
                    </p>
                  )}
                  {user.completedCourses && user.completedCourses.length > 0 && (
                    <p>
                      <strong>Completed Courses:</strong> {user.completedCourses.join(', ')}
                    </p>
                  )}
                  {loggedInUser?.role === 'instructor' && (
                    <>
                      <select
                        className="border p-2 mt-2"
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      <button
                      onClick={(e) => {
                        // e.stopPropagation();
                        console.log("Button clicked for user:", user._id);
                        handleAssignStudentToCourse(user._id);
                      }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                      >
                        Assign
                      </button>
                    </>
                  )}
                </>
              )}
              {user.role === 'instructor' && user.taughtCourses && user.taughtCourses.length > 0 && (
                <p>
                  <strong>Taught Courses:</strong> {user.taughtCourses.join(', ')}
                </p>
              )}
              {loggedInUser?.role === 'admin' && (
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors mt-2"
                >
                  Delete User
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;

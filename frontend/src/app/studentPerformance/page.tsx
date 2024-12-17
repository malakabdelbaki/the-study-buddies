'use client';

import React, { useEffect, useState } from "react";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // Register this to fix the error
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, // Register category scale
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// export default function StudentPerformancePage() {
//   const [studentData, setStudentData] = useState<any>(null); // Store fetched data
//   const [error, setError] = useState<string | null>(null); // Store error messages
//   const [loading, setLoading] = useState(true); // Manage loading state

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch the current user's data
//         const userResponse = await fetch(`/api/auth/me`, {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!userResponse.ok) {
//           throw new Error("Failed to fetch user data");
//         }

//         const user = await userResponse.json();

//         // Ensure the user is a student
//         if (user.role !== 'student') {
//           setError("This dashboard is only accessible for students.");
//           setLoading(false);
//           return;
//         }

//         // Fetch the student's performance data
//         const performanceResponse = await fetch(`/api/studentPerformance`, {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!performanceResponse.ok) {
//             if (performanceResponse.status === 404) {
//               setError("No progress data found for the student. Start a course to see your progress.");
//             } else {
//               throw new Error("Failed to fetch student performance data");
//             }
//             setLoading(false);
//             return;
//           }

//         const performanceData = await performanceResponse.json();

//         // Set the fetched data
//         setStudentData(performanceData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError("An error occurred while fetching student performance data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle loading state
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   // Handle error state
//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Handle empty data
//   if (!studentData || studentData.length === 0) {
//     return <div>No performance data available</div>;
//   }

//   return (
//     <div className="flex flex-col items-center w-full p-4">
//       <h1 className="text-xl font-bold mb-4">Student Dashboard</h1>
//       <table className="w-full table-auto border-collapse border border-gray-300">
//         <thead>
//           <tr>
//             <th className="border border-gray-300 px-4 py-2">Course Name</th>
//             <th className="border border-gray-300 px-4 py-2">Average Score</th>
//             <th className="border border-gray-300 px-4 py-2">Completion Percentage</th>
//             <th className="border border-gray-300 px-4 py-2">Last Accessed</th>
//           </tr>
//         </thead>
//         <tbody>
//           {studentData.map((course: any) => (
//             <tr key={course.courseId}>
//               <td className="border border-gray-300 px-4 py-2">{course.courseName}</td>
//               <td className="border border-gray-300 px-4 py-2">{course.averageScore}%</td>
//               <td className="border border-gray-300 px-4 py-2">{course.completionPercentage}%</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {new Date(course.lastAccessed).toLocaleString()}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



interface StudentPerformanceData {
  courseId: string;
  courseName: string;
  averageScore: number;
  completionPercentage: number;
  lastAccessed: string;
}




// ////workingggggggg
export default function StudentPerformancePage() {
  
  // const [performanceData, setPerformanceData] = useState<any>(null);
  // const [error, setError] = useState<string | null>(null);

  const [performanceData, setPerformanceData] = useState<StudentPerformanceData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch('/api/studentPerformance', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student performance data');
        }

        const data = await response.json();
        setPerformanceData(data);
      } catch (err: any) {
        console.error('Error fetching student performance:', err.message);
        setError('Error loading student performance data');
      }
    };

    fetchPerformanceData();
  }, []);

//   return (
//     <div className="flex flex-col items-center p-4">
//       <h1 className="text-2xl font-semibold mb-4">Student Performance Dashboard</h1>
//       {error && <p className="text-red-500">{error}</p>}
//       {performanceData ? (
//         <pre className="bg-gray-100 p-4 rounded w-full">
//           {JSON.stringify(performanceData, null, 2)}
//         </pre>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// }
if (error) {
  return <p className="text-red-500">{error}</p>;
}

if (!performanceData || performanceData.length === 0) {
  return <p>Loading student performance...</p>;
}

// Prepare data for the chart with course names
const chartData = {
  labels: performanceData.map((item) => item.courseName), // Course names as X-axis labels
  datasets: [
    {
      label: 'Average Score',
      data: performanceData.map((item) => item.averageScore),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    },
    {
      label: 'Completion (%)',
      data: performanceData.map((item) => item.completionPercentage),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    },
  ],
};

return (
  <div className="p-4">
    <h1 className="text-2xl font-semibold mb-4">Student Performance Dashboard</h1>

    {/* Chart Visualization */}
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Course Progress and Scores</h2>
      <Bar data={chartData} />
    </div>

    {/* Table Display */}
    <div>
      <h2 className="text-lg font-medium mb-2">Performance Details</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Course Name</th>
            <th className="border border-gray-300 px-4 py-2">Average Score</th>
            <th className="border border-gray-300 px-4 py-2">Completion (%)</th>
            <th className="border border-gray-300 px-4 py-2">Last Accessed</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((item) => (
            <tr key={item.courseId} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{item.courseName}</td>
              <td className="border border-gray-300 px-4 py-2">{item.averageScore}</td>
              <td className="border border-gray-300 px-4 py-2">{item.completionPercentage}%</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(item.lastAccessed).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}



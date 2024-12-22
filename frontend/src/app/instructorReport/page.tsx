// 'use client';

// import React, { useEffect, useState } from 'react';


// interface AnalyticsData {
//   courseId: string;
//   courseTitle: string;
//   totalStudents: number;
//   averageCompletion: number;
//   completedStudents: number;
//   CompletionPerformanceCategories: {
//     belowAverage: number;
//     average: number;
//     aboveAverage: number;
//     excellent: number;
//   };
// }

// interface QuizResultsData {
//   quizId: string;
//   quizTitle: string;
//   totalQuestions: number;
//   totalStudents: number;
//   averageScore: number;
//   studentResults: {
//     studentId: string;
//     studentName: string;
//     score: number;
//   }[];
// }

// interface ContentEffectivenessData {
//   courseId: string;
//   courseTitle: string;
//   courseRating: number;
//   instructorRating: number;
//   modules: {
//     moduleId: string;
//     moduleTitle: string;
//     moduleRating: number;
//   }[];
// }

// export default function InstructorDashboard() {
//   const [analytics, setAnalytics] = useState<AnalyticsData[] | null>(null);
//   const [quizResults, setQuizResults] = useState<QuizResultsData[] | null>(null);
//   const [contentEffectiveness, setContentEffectiveness] = useState<ContentEffectivenessData[] | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await fetch('/api/instructorReports', {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch instructor reports');
//         }

//         const data = await response.json();
//         setAnalytics(data.analytics);
//         setQuizResults(data.quizResults);
//         setContentEffectiveness(data.contentEffectiveness);
//       } catch (err: any) {
//         console.error('Error fetching instructor reports:', err.message);
//         setError('Error loading instructor reports');
//       }
//     };

//     fetchReports();
//   }, []);

  

//   const downloadReport = async (type: string, format: 'csv' | 'json') => {
//     try {
//       const response = await fetch(`/api/instructorReports?downloadType=${type}&format=${format}`);
//       if (!response.ok) {
//         throw new Error('Failed to download report');
//       }

//       const blob = await response.blob();
//       const downloadUrl = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `${type}.${format}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       alert('Failed to download the report. Please try again.');
//     }
//   };


  








//   if (error) return <p>{error}</p>;
//   if (!analytics && !quizResults && !contentEffectiveness) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Instructor Dashboard</h1>

//       <h2>Analytics</h2>
//       <button onClick={() => downloadReport('analytics', 'json')}>Download Analytics (JSON)</button>
//       <button onClick={() => downloadReport('analytics', 'csv')}>Download Analytics (CSV)</button>
//       {analytics?.length ? (
//         analytics.map((course) => (
//           <div key={course.courseId} style={{ marginBottom: '20px' }}>
//             <h3>{course.courseTitle}</h3>
//             <p>Total Students: {course.totalStudents}</p>
//             <p>Average Completion: {course.averageCompletion}%</p>
//             <p>Completed Students: {course.completedStudents}</p>
//             <p>Performance Categories:</p>
//             <ul>
//               <li>Below Average: {course.CompletionPerformanceCategories.belowAverage}</li>
//               <li>Average: {course.CompletionPerformanceCategories.average}</li>
//               <li>Above Average: {course.CompletionPerformanceCategories.aboveAverage}</li>
//               <li>Excellent: {course.CompletionPerformanceCategories.excellent}</li>
//             </ul>
//           </div>
//         ))
//       ) : (
//         <p>No analytics data found.</p>
//       )}

//       <h2>Quiz Results</h2>
//       <button onClick={() => downloadReport('quiz-results', 'json')}>Download Quiz Results (JSON)</button>
//       <button onClick={() => downloadReport('quiz-results', 'csv')}>Download Quiz Results (CSV)</button>
//       {quizResults?.length ? (
//         quizResults.map((quiz) => (
//           <div key={quiz.quizId} style={{ marginBottom: '20px' }}>
//             <h3>{quiz.quizTitle}</h3>
//             <p>Total Questions: {quiz.totalQuestions}</p>
//             <p>Total Students: {quiz.totalStudents}</p>
//             <p>Average Score: {quiz.averageScore}</p>
//             <h4>Student Results:</h4>
//             <ul>
//               {quiz.studentResults.map((result) => (
//                 <li key={result.studentId}>
//                   {result.studentName}: {result.score}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))
//       ) : (
//         <p>No quiz results found.</p>
//       )}

//       <h2>Content Effectiveness</h2>
//       <button onClick={() => downloadReport('content-effectiveness', 'json')}>
//         Download Content Effectiveness (JSON)
//       </button>
//       <button onClick={() => downloadReport('content-effectiveness', 'csv')}>
//         Download Content Effectiveness (CSV)
//       </button>
//       {contentEffectiveness?.length ? (
//         contentEffectiveness.map((course) => (
//           <div key={course.courseId} style={{ marginBottom: '20px' }}>
//             <h3>{course.courseTitle}</h3>
//             <p>Course Rating: {course.courseRating}</p>
//             <p>Instructor Rating: {course.instructorRating}</p>
//             <h4>Modules:</h4>
//             <ul>
//               {course.modules.map((module) => (
//                 <li key={module.moduleId}>
//                   {module.moduleTitle}: {module.moduleRating}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))
//       ) : (
//         <p>No content effectiveness data found.</p>
//       )}
//     </div>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function InstructorDashboard() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [contentEffectiveness, setContentEffectiveness] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/instructorReports', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch instructor reports');
        }

        const data = await response.json();
        setAnalytics(data.analytics);
        setQuizResults(data.quizResults);
        setContentEffectiveness(data.contentEffectiveness);
      } catch (err: any) {
        console.error('Error fetching instructor reports:', err.message);
        setError('Error loading instructor reports');
      }
    };

    fetchReports();
  }, []);

  // const downloadReport = async (type: string, format: 'csv' | 'json') => {
  //   try {
  //     const response = await fetch(`/api/instructorReports?downloadType=${type}&format=${format}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to download report')   
  //     }

  //     // const contentType = response.headers.get('Content-Type');
  //     // if (format === 'json' && contentType?.includes('application/json')) {
  //     //   // Handle JSON file
  //     //   const jsonData = await response.json();
  //     //   const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }); // Add indentation
  //     //   const downloadUrl = URL.createObjectURL(blob);
  //     //   const link = document.createElement('a');
  //     //   link.href = downloadUrl;
  //     //   link.download = `${type}.json`;
  //     //   document.body.appendChild(link);
  //     //   link.click();
  //     //   document.body.removeChild(link);
  //     // } else if (format === 'csv') {
  //     //   // Handle CSV file
  //     //   const csvData = await response.text(); // Read as plain text
  //     //   console.log('CSV Content:', csvData); // Debug CSV content
  //     //   // Ensure proper handling of line breaks for CSV content
  //     //   const normalizedCSV = csvData.replace(/(?!\r)\n/g, '\r\n');
  //     //   const blob = new Blob([normalizedCSV], { type: 'text/csv;charset=utf-8;' });
  //     //   const downloadUrl = URL.createObjectURL(blob);
  //     //   const link = document.createElement('a');
  //     //   link.href = downloadUrl;
  //     //   link.download = `${type}.csv`;
  //     //   document.body.appendChild(link);
  //     //   link.click();
  //     //   document.body.removeChild(link);
  //     // } else {
  //     //   throw new Error('Unexpected content type');
  //     // }

  //   } catch (error) {
  //     console.error('Error downloading report:', error);
  //     alert('Failed to download the report. Please try again.');
  //   }
  // };



  // const downloadReport = async (type: string, format: 'csv' | 'json') => {
  //   try {
  //     const response = await fetch(`/api/instructorReports?downloadType=${type}&format=${format}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to download report');
  //     }

  //     const blob = await response.blob();
  //     const downloadUrl = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = downloadUrl;
  //     link.download = `${type}.${format}`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error('Error downloading report:', error);
  //     alert('Failed to download the report. Please try again.');
  //   }
  // };

  const downloadReport = async (type: string, format: 'csv' | 'json') => {
    try {
      console.log(`Initiating download for type: ${type}, format: ${format}`);
      
      const response = await fetch(`/api/instructorReports?downloadType=${type}&format=${format}`);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Failed to download report: ${response.statusText}`);
      }
  
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download completed successfully.');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download the report. Please try again.');
    }
  };






  if (error) return <p>{error}</p>;
  if (!analytics.length && !quizResults.length && !contentEffectiveness.length)
    return <p>Loading...</p>;

  return (
    
  
  <div style={{ padding: '20px' }}>
  <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '2rem' }}>Instructor Dashboard</h1>




{/* Analytics Section */}
<section style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
    Reports on Student Engagement
  </h2>

  
{/* Download Buttons */}
<div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <button
      onClick={() => downloadReport('analytics', 'json')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Report (JSON)
    </button>
    <button
      onClick={() => downloadReport('analytics', 'csv')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Report (CSV)
    </button>
  </div>



  {analytics.length > 0 && (
    <>
      {/* Bar Chart for Total vs Completed Students */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          Total vs Completed Students
        </h3>
        <Bar
          data={{
            labels: analytics.map((course) => course.courseTitle),
            datasets: [
              {
                label: 'Total Students',
                data: analytics.map((course) => course.totalStudents),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
              },
              {
                label: 'Completed Students',
                data: analytics.map((course) => course.completedStudents),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Analytics: Total vs Completed Students' },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Students' },
              },
              x: {
                title: { display: true, text: 'Courses' },
              },
            },
          }}
        />
      </div>

      {/* Pie Charts for Average Completion Rates */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          Average Completion Rates
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {analytics.map((course) => (
            <div key={course.courseId} style={{ width: '250px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>{course.courseTitle}</h4>
              <Pie
                data={{
                  labels: ['Completed', 'Remaining'],
                  datasets: [
                    {
                      label: 'Completion Rate',
                      data: [course.averageCompletion, 100 - course.averageCompletion],
                      backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(192, 192, 192, 0.7)'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: `${course.averageCompletion}% Completed` },
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overall Performance by Grades */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          Overall Student Performance (Grades)
        </h3>
        <Bar
          data={{
            labels: ['Below Average', 'Average', 'Above Average', 'Excellent'],
            datasets: [
              {
                label: 'Number of Students',
                data: analytics[0]?.overallstudentPerformance
                  ? Object.values(analytics[0].overallstudentPerformance)
                  : [0, 0, 0, 0],
                backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB', '#4BC0C0'],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Performance by Grades' },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Students' },
              },
              x: {
                title: { display: true, text: 'Performance Categories' },
              },
            },
          }}
        />
      </div>

      {/* Module Performance as Table */}
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          Module Performance
        </h3>
        {analytics.map((course) => (
          <div key={course.courseId} style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{course.courseTitle}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Module Title</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Students</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Average Score</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Below Average</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Average</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Above Average</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Excellent</th>
                </tr>
              </thead>
              <tbody>
                {course.modulesPerformance.map((module: { moduleId: React.Key | null | undefined; moduleTitle: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; totalStudents: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; averageScore: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined; performanceCategories: { belowAverage: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; average: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; aboveAverage: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; excellent: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }; }) => (
                  <tr key={module.moduleId}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.moduleTitle}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.totalStudents}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {module.averageScore !== null ? module.averageScore : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.performanceCategories.belowAverage}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.performanceCategories.average}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.performanceCategories.aboveAverage}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{module.performanceCategories.excellent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  )}
</section>







{/* Content Effectiveness Section */}
<section style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
  <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
    Content Effectiveness
  </h2>

  {/* Download Buttons */}
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <button
      onClick={() => downloadReport('content-effectiveness', 'json')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Content Effectiveness (JSON)
    </button>
    <button
      onClick={() => downloadReport('content-effectiveness', 'csv')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Content Effectiveness (CSV)
    </button>
  </div>

  {contentEffectiveness?.length > 0 ? (
    contentEffectiveness.map((course) => (
      <div
        key={course.courseId}
        style={{
          marginBottom: '20px',
          padding: '15px',
          borderBottom: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '10px' }}>
          {course.courseTitle}
        </h3>

        {/* Course Rating */}
        <p style={{ fontSize: '1rem', marginBottom: '5px' }}>
          <strong>Course Rating:</strong>{' '}
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} style={{ color: index < course.courseRating ? '#FFD700' : '#ccc' }}>★</span>
          ))}
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#555' }}>
            ({course.courseRating.toFixed(1)})
          </span>
        </p>

        {/* Instructor Rating */}
        <p style={{ fontSize: '1rem', marginBottom: '10px' }}>
          <strong>Instructor Rating:</strong>{' '}
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} style={{ color: index < course.instructorRating ? '#FFD700' : '#ccc' }}>★</span>
          ))}
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#555' }}>
            ({course.instructorRating.toFixed(1)})
          </span>
        </p>

        {/* Modules */}
        {course.modules.length > 0 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
              Modules
            </h4>
            {course.modules.map((module: { moduleId: React.Key | null | undefined; moduleTitle: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; moduleRating: number; }) => (
              <div key={module.moduleId} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0 }}>
                  <strong>{module.moduleTitle}:</strong>{' '}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} style={{ color: index < module.moduleRating ? '#FFD700' : '#ccc' }}>★</span>
                  ))}
                  <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#555' }}>
                    ({module.moduleRating.toFixed(1)})
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    <p style={{ textAlign: 'center', color: '#666' }}>No content effectiveness data found.</p>
  )}
</section>








      
    {/* Quiz Results Section */}
    <section style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
  <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
    Quiz Results
  </h2>

  {/* Download Buttons */}
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <button
      onClick={() => downloadReport('quiz-results', 'json')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Quiz Results (JSON)
    </button>
    <button
      onClick={() => downloadReport('quiz-results', 'csv')}
      style={{
        display: 'inline-block',
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      Download Quiz Results (CSV)
    </button>
  </div>

  {/* Total Questions Bar Chart */}
  <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Total Questions</h3>
  {quizResults?.length > 0 && (
    <div style={{ marginBottom: '30px' }}>
      <Bar
        data={{
          labels: quizResults.map((quiz) => quiz.quizTitle),
          datasets: [
            {
              label: 'Total Questions',
              data: quizResults.map((quiz) => quiz.totalQuestions || 0),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total Questions in Quizzes' },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Questions' } },
          },
        }}
      />
    </div>
  )}

  {/* Total Students Bar Chart */}
  <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Total Students</h3>
  {quizResults?.length > 0 && (
    <div style={{ marginBottom: '30px' }}>
      <Bar
        data={{
          labels: quizResults.map((quiz) => quiz.quizTitle),
          datasets: [
            {
              label: 'Total Students',
              data: quizResults.map((quiz) => quiz.totalStudents || 0),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total Students in Quizzes' },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Students' } },
          },
        }}
      />
    </div>
  )}

  {/* Average Score Bar Chart */}
  <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Average Scores</h3>
  {quizResults?.length > 0 && (
    <div style={{ marginBottom: '30px' }}>
      <Bar
        data={{
          labels: quizResults.map((quiz) => quiz.quizTitle),
          datasets: [
            {
              label: 'Average Score',
              data: quizResults.map((quiz) => quiz.averageScore || 0),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Average Scores in Quizzes' },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Scores' } },
          },
        }}
      />
    </div>
  )}

  {/* Student Results Table */}
  <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Student Results</h3>
  {quizResults?.length > 0 ? (
    quizResults.map((quiz) => (
      <div
        key={quiz.quizId}
        style={{
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
          {quiz.quizTitle}
        </h4>
        {quiz.studentResults.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Student Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {quiz.studentResults.map((result: { studentId: React.Key | null | undefined; studentName: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; score: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
                <tr key={result.studentId}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.studentName}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No student results available for this quiz.</p>
        )}
      </div>
    ))
  ) : (
    <p style={{ textAlign: 'center', color: '#666' }}>No quiz results found.</p>
  )}
</section>







    </div>
  );
}

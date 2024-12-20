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

  const downloadReport = async (type: string, format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/instructorReports?downloadType=${type}&format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
<section>
  <h2>Analytics</h2>
  <button onClick={() => downloadReport('analytics', 'json')}>Download Analytics (JSON)</button>
  <button onClick={() => downloadReport('analytics', 'csv')}>Download Analytics (CSV)</button>
  
  {analytics.length > 0 && (
    <>
      {/* Bar Chart for Total vs Completed Students */}
      <Bar
        data={{
          labels: analytics.map((course) => course.courseTitle),
          datasets: [
            {
              label: 'Total Students',
              data: analytics.map((course) => course.totalStudents),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Completed Students',
              data: analytics.map((course) => course.completedStudents),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Analytics: Total vs Completed Students' },
          },
        }}
      />

      {/* Pie Charts for Average Completion Rates */}
      <h3>Average Completion Rates</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {analytics.map((course) => (
          <div key={course.courseId} style={{ width: '200px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '16px' }}>{course.courseTitle}</h4>
            <Pie
              data={{
                labels: ['Average Completion', 'Remaining'],
                datasets: [
                  {
                    label: 'Completion Rate',
                    data: [course.averageCompletion, 100 - course.averageCompletion],
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(192, 192, 192, 0.6)'],
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

      {/* Overall Performance by Grades */}
      <h3>Student Performance Based on Grades</h3>
      <Bar
        data={{
          labels: ['Below Average', 'Average', 'Above Average', 'Excellent'],
          datasets: [
            {
              label: 'Number of Students',
              data: analytics[0]?.overallstudentPerformance
                ? Object.values(analytics[0].overallstudentPerformance)
                : [0, 0, 0, 0],
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Overall Student Performance (Grades)' },
          },
        }}
      />

      {/* Performance Based on Course Completion */}
      <h3>Performance Based on Course Completion</h3>
      <Bar
        data={{
          labels: ['Below Average', 'Average', 'Above Average', 'Excellent'],
          datasets: [
            {
              label: 'Number of Students',
              data: analytics[0]?.CompletionPerformanceCategories
                ? Object.values(analytics[0].CompletionPerformanceCategories)
                : [0, 0, 0, 0],
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Performance Based on Course Completion' },
          },
        }}
      />

      {/* Module Performance as Table */}
      <h3>Module Performance</h3>
      {analytics.map((course) => (
        <div key={course.courseId} style={{ marginBottom: '20px' }}>
          <h4>{course.courseTitle}</h4>
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
    </>
  )}
</section>


      
    {/* Quiz Results Section */}
<section style={{ marginTop: '30px' }}>
  <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Quiz Results</h2>
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <button onClick={() => downloadReport('quiz-results', 'json')}>Download Quiz Results (JSON)</button>
    <button onClick={() => downloadReport('quiz-results', 'csv')}>Download Quiz Results (CSV)</button>
  </div>

  {/* Total Questions Bar Chart */}
  <h3>Total Questions</h3>
  {quizResults?.length > 0 && (
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
      }}
    />
  )}

  {/* Total Students Bar Chart */}
  <h3>Total Students</h3>
  {quizResults?.length > 0 && (
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
      }}
    />
  )}

  {/* Average Score Bar Chart */}
  <h3>Average Scores</h3>
  {quizResults?.length > 0 && (
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
      }}
    />
  )}

  {/* Student Results Table */}
  <h3>Student Results</h3>
  {quizResults?.length > 0 ? (
    quizResults.map((quiz) => (
      <div key={quiz.quizId} style={{ marginBottom: '20px' }}>
        <h4>{quiz.quizTitle}</h4>
        {quiz.studentResults.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Student Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {quiz.studentResults.map((result: { studentId: React.Key | null | undefined; studentName: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; score: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
                <tr key={result.studentId}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.studentName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No student results available for this quiz.</p>
        )}
      </div>
    ))
  ) : (
    <p>No quiz results found.</p>
  )}
</section>





{/* Content Effectiveness Section */}
<section style={{ marginTop: '30px' }}>
  <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Content Effectiveness</h2>
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <button onClick={() => downloadReport('content-effectiveness', 'json')}>Download Content Effectiveness (JSON)</button>
    <button onClick={() => downloadReport('content-effectiveness', 'csv')}>Download Content Effectiveness (CSV)</button>
  </div>

  {contentEffectiveness?.length > 0 ? (
    contentEffectiveness.map((course) => (
      <div key={course.courseId} style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h3>{course.courseTitle}</h3>

        {/* Course Rating */}
        <p>
          <strong>Course Rating:</strong>{' '}
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} style={{ color: index < course.courseRating ? '#FFD700' : '#ccc' }}>★</span>
          ))}
          <span style={{ marginLeft: '10px' }}>({course.courseRating.toFixed(1)})</span>
        </p>

        {/* Instructor Rating */}
        <p>
          <strong>Instructor Rating:</strong>{' '}
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} style={{ color: index < course.instructorRating ? '#FFD700' : '#ccc' }}>★</span>
          ))}
          <span style={{ marginLeft: '10px' }}>({course.instructorRating.toFixed(1)})</span>
        </p>

        {/* Modules */}
        {course.modules.length > 0 && (
          <div>
            <h4>Modules</h4>
            {course.modules.map((module: { moduleId: React.Key | null | undefined; moduleTitle: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; moduleRating: number; }) => (
              <div key={module.moduleId} style={{ marginBottom: '10px' }}>
                <p>
                  <strong>{module.moduleTitle}:</strong>{' '}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} style={{ color: index < module.moduleRating ? '#FFD700' : '#ccc' }}>★</span>
                  ))}
                  <span style={{ marginLeft: '10px' }}>({module.moduleRating.toFixed(1)})</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    <p>No content effectiveness data found.</p>
  )}
</section>

    </div>
  );
}

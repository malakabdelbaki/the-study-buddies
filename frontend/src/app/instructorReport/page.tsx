'use client';

import React, { useEffect, useState } from 'react';

interface AnalyticsData {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  averageCompletion: number;
  completedStudents: number;
  CompletionPerformanceCategories: {
    belowAverage: number;
    average: number;
    aboveAverage: number;
    excellent: number;
  };
}

interface QuizResultsData {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  totalStudents: number;
  averageScore: number;
  studentResults: {
    studentId: string;
    studentName: string;
    score: number;
  }[];
}

interface ContentEffectivenessData {
  courseId: string;
  courseTitle: string;
  courseRating: number;
  instructorRating: number;
  modules: {
    moduleId: string;
    moduleTitle: string;
    moduleRating: number;
  }[];
}

export default function InstructorDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData[] | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResultsData[] | null>(null);
  const [contentEffectiveness, setContentEffectiveness] =
    useState<ContentEffectivenessData[] | null>(null);
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
  if (!analytics && !quizResults && !contentEffectiveness) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Instructor Dashboard</h1>

      <h2>Analytics</h2>
      <button onClick={() => downloadReport('analytics', 'json')}>Download Analytics (JSON)</button>
      <button onClick={() => downloadReport('analytics', 'csv')}>Download Analytics (CSV)</button>
      {analytics?.length ? (
        analytics.map((course) => (
          <div key={course.courseId} style={{ marginBottom: '20px' }}>
            <h3>{course.courseTitle}</h3>
            <p>Total Students: {course.totalStudents}</p>
            <p>Average Completion: {course.averageCompletion}%</p>
            <p>Completed Students: {course.completedStudents}</p>
            <p>Performance Categories:</p>
            <ul>
              <li>Below Average: {course.CompletionPerformanceCategories.belowAverage}</li>
              <li>Average: {course.CompletionPerformanceCategories.average}</li>
              <li>Above Average: {course.CompletionPerformanceCategories.aboveAverage}</li>
              <li>Excellent: {course.CompletionPerformanceCategories.excellent}</li>
            </ul>
          </div>
        ))
      ) : (
        <p>No analytics data found.</p>
      )}

      <h2>Quiz Results</h2>
      <button onClick={() => downloadReport('quiz-results', 'json')}>Download Quiz Results (JSON)</button>
      <button onClick={() => downloadReport('quiz-results', 'csv')}>Download Quiz Results (CSV)</button>
      {quizResults?.length ? (
        quizResults.map((quiz) => (
          <div key={quiz.quizId} style={{ marginBottom: '20px' }}>
            <h3>{quiz.quizTitle}</h3>
            <p>Total Questions: {quiz.totalQuestions}</p>
            <p>Total Students: {quiz.totalStudents}</p>
            <p>Average Score: {quiz.averageScore}</p>
            <h4>Student Results:</h4>
            <ul>
              {quiz.studentResults.map((result) => (
                <li key={result.studentId}>
                  {result.studentName}: {result.score}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No quiz results found.</p>
      )}

      <h2>Content Effectiveness</h2>
      <button onClick={() => downloadReport('content-effectiveness', 'json')}>
        Download Content Effectiveness (JSON)
      </button>
      <button onClick={() => downloadReport('content-effectiveness', 'csv')}>
        Download Content Effectiveness (CSV)
      </button>
      {contentEffectiveness?.length ? (
        contentEffectiveness.map((course) => (
          <div key={course.courseId} style={{ marginBottom: '20px' }}>
            <h3>{course.courseTitle}</h3>
            <p>Course Rating: {course.courseRating}</p>
            <p>Instructor Rating: {course.instructorRating}</p>
            <h4>Modules:</h4>
            <ul>
              {course.modules.map((module) => (
                <li key={module.moduleId}>
                  {module.moduleTitle}: {module.moduleRating}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No content effectiveness data found.</p>
      )}
    </div>
  );
}


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


if (error) {
  return <p className="text-red-500">{error}</p>;
}

if (!performanceData || performanceData.length === 0) {
  return <p>Loading student performance...</p>;
}

// Prepare data for the chart with course names

const chartData = {
  labels: performanceData.map((item) => item.courseName),
  datasets: [
    {
      label: 'Average Score',
      data: performanceData.map((item) => item.averageScore),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'Completion Rate (%)',
      data: performanceData.map((item) => item.completionPercentage),
      backgroundColor: 'rgba(159, 39, 157, 0.6)',
      borderColor: 'rgb(131, 18, 133)',
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const, // Ensure type safety with 'as const'
    },
    title: {
      display: true,
      text: 'Average Score and Completion Rate by Course',
      font: {
        size: 18,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Values',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Courses',
      },
    },
  },
};


return (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
      Student Performance Dashboard
    </h1>

    {/* Chart Visualization */}
    <div style={{ marginBottom: '40px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>

    {/* Table Display */}
    <div>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
        Performance Details
      </h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '0 auto',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ border: '1px solid #ddd', padding: '12px' }}>Course Name</th>
            <th style={{ border: '1px solid #ddd', padding: '12px' }}>Average Score</th>
            <th style={{ border: '1px solid #ddd', padding: '12px' }}>Completion (%)</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((item) => (
            <tr key={item.courseId} style={{ textAlign: 'center' }}>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{item.courseName}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{item.averageScore}</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>{item.completionPercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}



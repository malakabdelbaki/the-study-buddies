'use client';
import { useAuthorization } from "@/hooks/useAuthorization";
import React, { useEffect, useState } from "react";
import Link from 'next/link'; // Import Link from nextjs to navigate

export default function AdminHomePage() {
  useAuthorization(['admin']);
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch latest logs (e.g., last 5 logs)
        const response = await fetch('/api/log?limit=5', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data);

      } catch (error) {
        setError('Error fetching logs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome Back, Admin!</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Latest Logs</h2>
        {loading ? (
          <p>Loading logs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            {logs.length === 0 ? (
              <p>No logs available</p>
            ) : (
              <div>
                {logs.map((log: any, index: number) => (
                  <div key={index} className="p-2 border-b border-gray-200">
                    <p><strong>{log.timestamp}</strong> - <em>{log.level}</em>: {log.message}</p>
                    {log.meta && (
                      <pre className="bg-gray-100 p-2 text-sm">{JSON.stringify(log.meta, null, 2)}</pre>
                    )}
                  </div>
                ))}
                <Link
                  href="/log"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 inline-block"
                >
                  View More Logs
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

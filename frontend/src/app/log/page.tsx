'use client';

import React, { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<string>('');  // For filtering logs by level
  const [limit, setLimit] = useState<number>(50);  // For limiting the number of logs fetched

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("try start!");
        /*const queryParams = new URLSearchParams();
        if (level) queryParams.append('level', level);
        if (limit) queryParams.append('limit', limit.toString());*/

        console.log("hello1");
        const response = await fetch(`http://localhost:3001/api/logs`, {
          method: 'GET',
          cache: 'no-store',
          //credentials: 'include',
        });
        
        console.log("hello2");
        if (!response.ok) {
          console.log("failed to fetch logs");
          console.log(response)
          throw new Error("Failed to fetch logs");
        }

        console.log("hello3");
        const data = await response.json();
        setLogs(data);
        console.log("hello4");

      } catch (error) {
        console.log("we're catching sadly");
        setError('Error fetching logs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [level, limit]); // Re-fetch logs when level or limit changes

  return (
    <div className="flex justify-center w-full p-4">
      <div className="w-full max-w-4xl">
        <h1>Logs</h1>
        {loading ? (
          <p>Loading logs...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div>
            <div className="mb-4">
              <label>Filter by level: </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="ml-2 p-2 border border-gray-300 rounded"
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="mb-4">
              <label>Limit logs: </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="1"
                className="ml-2 p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              {logs.length === 0 ? (
                <p>No logs available</p>
              ) : (
                <ul>
                  {logs.map((log: any, index: number) => (
                    <li key={index} className="p-2 border-b border-gray-200">
                      <p><strong>{log.timestamp}</strong> - <em>{log.level}</em>: {log.message}</p>
                      {log.meta && (
                        <pre className="bg-gray-100 p-2 text-sm">{JSON.stringify(log.meta, null, 2)}</pre>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

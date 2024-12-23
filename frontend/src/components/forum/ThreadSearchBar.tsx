
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Thread } from '@/types/Thread';
import Link from 'next/link';

const ThreadSearchBar: React.FC<{ forumId: string, courseId: string }> = ({ forumId, courseId }) => {
  const [query, setQuery] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setThreads([]);
      return;
    }

    const fetchThreads = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/forum/${forumId}/threads/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setThreads(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to fetch threads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchThreads, 300);
    return () => clearTimeout(debounce);
  }, [query, forumId]);

  return (
    <div className="w-full mb-4">
      <Input
        type="text"
        placeholder="Search threads..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-4"  // Make the search bar full width
      />

      {error && (
        <Alert variant="destructive">
          <p className="text-red-600">{error}</p>
        </Alert>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {!loading && threads.map((thread) => (
          <Link key={thread._id} href={`./${forumId}/threads/${thread._id}`}>
          <Card key={thread._id} className="shadow hover:shadow-sm transition w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-sm font-bold">{thread.title}</CardTitle>
              <p className="text-sm text-gray-700">{thread.content}</p>
            </CardHeader>
          </Card>
          </Link>
        ))}
        {!loading && !threads.length && query && (
          <p className="text-sm text-gray-500">No threads found matching "{query}".</p>
        )}
      </div>
    </div>
  );
};

export default ThreadSearchBar;

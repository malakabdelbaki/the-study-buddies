import { Thread } from "@/types/Thread";

const ThreadCard = ({ thread }: { thread: Thread }) => (
  <div className="border p-4 rounded shadow-md mb-4">
    <h2 className="font-semibold text-xl">{thread.title}</h2>
    <p className="text-gray-600">{thread.content}</p>
    <p className="text-gray-500"> posted by: {thread.creator_name}</p>
  </div>
);

export default ThreadCard;
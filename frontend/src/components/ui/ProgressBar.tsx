// components/ui/ProgressBar.tsx

interface ProgressBarProps {
    value: number;
    max: number;
  }
  
  const ProgressBar = ({ value, max }: ProgressBarProps) => {
    const percentage = Math.min((value / max) * 100, 100); // Ensure it doesn't exceed 100%
  
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };
  
  export default ProgressBar;
  
import React from "react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center text-red-700 text-lg">
      <p>{message}</p>
      {onRetry && (
        <button 
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-3 px-6 rounded text-lg transition"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

import React from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
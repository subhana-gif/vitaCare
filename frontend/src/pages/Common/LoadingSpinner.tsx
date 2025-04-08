import React from "react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = "md" }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <div
        className={`border-4 border-blue-500 border-t-transparent rounded-full animate-spin ${
          sizeMap[size]
        }`}
      />
    </div>
  );
};

export default LoadingSpinner;

import React from "react";

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="bg-white shadow rounded-lg p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-500 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments found</h3>
      <p className="text-gray-500 text-lg mb-6">
        {hasFilters
          ? "Try changing your search or filter criteria" 
          : "You don't have any appointments scheduled yet"}
      </p>
      <a 
        href="/doctors" 
        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Find a Doctor
      </a>
    </div>
  );
};

export default EmptyState;
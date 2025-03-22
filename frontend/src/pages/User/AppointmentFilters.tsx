import React from "react";

interface AppointmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search doctors"
          className="border border-gray-300 p-3 pl-12 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 p-3 rounded-lg bg-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <option value="all">All Appointments</option>
        <option value="paid">Paid Only</option>
        <option value="unpaid">Unpaid Only</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
};

export default AppointmentFilters;
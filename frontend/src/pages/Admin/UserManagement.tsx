import React, { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import CommonTable from "../../components/common/table";

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(5);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.fetchUsers();
        console.log("Fetched Users:", data);
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users.");
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchTerm.toLowerCase().trim();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  const handleToggleBlock = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      await userService.toggleDoctorBlockStatus(userId);
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
    } catch (error) {
      console.error("Error toggling user block status:", error);
      setError("Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  // Clear search
  const handleClearSearch = () => setSearchTerm("");

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: (user: User) => (
        <span className={`border p-2 ${user.isBlocked ? "text-red-500" : "text-green-500"}`}>
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <button
          className={`px-4 py-2 rounded ${user.isBlocked ? "bg-green-500" : "bg-red-500"} text-white`}
          onClick={() => handleToggleBlock(user._id)}
          disabled={loading}
        >
          {user.isBlocked ? "Unblock" : "Block"}
        </button>
      ),
    },
  ];

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxDisplayedPages = 5;
    
    if (totalPages <= maxDisplayedPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of displayed pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page if not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin User Management</h2>
      
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
          <div className="pl-4 pr-2 py-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="flex-1 py-2.5 px-2 border-0 focus:ring-0 focus:outline-none"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch} 
              className="px-4 py-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Display search results count */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-500">
          Found {filteredUsers.length} results for "{searchTerm}"
        </div>
      )}
      
      {/* Table component */}
      <CommonTable 
        data={currentUsers} 
        columns={columns} 
        loading={loading} 
        error={error} 
      />
      
      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-center mt-6 gap-4">
        <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Previous
            </button>
            
            {getPaginationNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-1.5">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-1.5 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { Search, Plus, CheckCircle, XCircle } from "lucide-react";
import Pagination from "../Common/Pagination";
import { adminService } from "../../services/adminSevice";

interface Speciality {
    _id: string;
    name: string;
    isActive: boolean;
}

const SpecialityManagement: React.FC = () => {
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [newSpeciality, setNewSpeciality] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); 
    const token = localStorage.getItem("adminToken")

    useEffect(() => {
        const fetchSpecialities = async () => {
            setIsLoading(true);
            try {
                const data = await adminService.fetchSpecialities();
                setSpecialities(data);
            } catch (error) {
                toast.error("Failed to fetch specialities.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSpecialities();
    }, []);


    const handleAddSpeciality = async () => {
      if (!newSpeciality.trim()) {
        toast.warn("Please enter a valid speciality name.");
        return;
      }
      if(!token)return
    
      try {
        await adminService.addSpeciality(newSpeciality, token); 
        toast.success("Speciality added successfully!");
        setNewSpeciality("");
    
        const updatedSpecialities = await adminService.fetchSpecialities(); 
        setSpecialities(updatedSpecialities);
      } catch (error: any) {
        toast.error(error.message || "Error adding speciality.");
      }
    };
    
    const handleToggleStatus = async (id: string) => {
        if(!token)return
        try {
          const updatedSpeciality = await adminService.toggleSpecialityStatus(id, token);
      
          setSpecialities((prevSpecialities) =>
            prevSpecialities.map((spec) =>
              spec._id === id ? { ...spec, isActive: updatedSpeciality.isActive } : spec
            )
          );
      
          toast.success(
            `Speciality ${updatedSpeciality.isActive ? "activated" : "deactivated"} successfully!`
          );
        } catch (error: any) {
          toast.error(error.message || "Error toggling speciality status.");
        }
      };    
    
    const filteredSpecialities = specialities.filter(spec => 
        spec.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (showInactive || spec.isActive)
    );

    const sortedSpecialities = [...filteredSpecialities].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedSpecialities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedSpecialities.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white shadow-lg p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Speciality Management</h1>
            
            {/* Add Speciality Form */}
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Speciality</h2>
                <div className="flex">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Enter speciality name"
                            value={newSpeciality}
                            onChange={(e) => setNewSpeciality(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSpeciality()}
                        />
                    </div>
                    <button
                        onClick={handleAddSpeciality}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg transition-colors text-lg"
                    >
                        <Plus size={20} className="mr-2" />
                        Add
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search specialities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showInactive} 
                            onChange={() => setShowInactive(!showInactive)}
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-gray-700 font-medium">Show Inactive</span>
                    </label>
                </div>
            </div>

            {/* Specialities List */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center py-4 px-6 bg-gray-100">
                    <span className="font-semibold text-gray-700 text-lg">Speciality Name</span>
                    <span className="font-semibold text-gray-700 text-lg">Status</span>
                </div>
                
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500 text-lg">Loading specialities...</div>
                ) : currentItems.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-lg">
                        {searchTerm ? "No matching specialities found." : "No specialities available."}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {currentItems.map((spec) => (
                            <li key={spec._id} className="flex justify-between items-center py-4 px-6 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">
                                    {spec.isActive ? (
                                        <CheckCircle size={20} className="text-green-500 mr-3" />
                                    ) : (
                                        <XCircle size={20} className="text-red-500 mr-3" />
                                    )}
                                    <span className={`${spec.isActive ? "text-gray-800" : "text-gray-500"} text-lg`}>
                                        {spec.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(spec._id)}
                                    className={`px-4 py-2 rounded-full text-base font-medium ${
                                        spec.isActive 
                                            ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                    } transition-colors`}
                                >
                                    {spec.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && sortedSpecialities.length > 0 && (
                <div className="mt-6">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default SpecialityManagement;
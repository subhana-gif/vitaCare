import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { slotService } from "../../services/slotService";
import Pagination from "../Common/Pagination";
import { formatTime, validateTimeRange } from "../../utils/timeUtils";
import LoadingSpinner from "../Common/LoadingSpinner";

interface Slot {
  isAvailable: boolean;
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked";
  startDate?: string;
  endDate?: string;
}

const daysOfWeekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SlotManagement: React.FC = () => {
  // State management
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [price, setPrice] = useState<number>(0);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStartTime, setEditingStartTime] = useState<string>("");
  const [editingEndTime, setEditingEndTime] = useState<string>("");
  const [sortBy, setSortBy] = useState<"dayOfWeek" | "startTime" | "price" | "status" | "startDate">("dayOfWeek");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(7);
  
  // Date range states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editingStartDate, setEditingStartDate] = useState<string>("");
  const [editingEndDate, setEditingEndDate] = useState<string>("");

  // Redux state
  const doctorId = useSelector((state: RootState) => state.doctors.doctorId);
  const token = useSelector((state: RootState) => state.doctors.token);

  useEffect(() => {
    if (doctorId) fetchSlots();
  }, [doctorId]);

  const fetchSlots = async () => {
    if (!doctorId || !token) return;
    try {
      const data = await slotService.fetchSlots(doctorId, token);
      const validSlots = Array.isArray(data) ? data.filter(slot => 
        slot && slot._id && slot.dayOfWeek && slot.startTime && slot.endTime && slot.price !== undefined
      ) : [];
      setSlots(validSlots);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      toast.error("Failed to fetch slots.");
      setSlots([]);
    }
  };

  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) {
      toast.warn("Please select both start and end dates.");
      return false;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      toast.warn("End date must be after start date.");
      return false;
    }

    return true;
  };

  const handleAddDefaultSlots = async () => {
    if (!startTime || !endTime || price <= 0 || selectedDays.length === 0) {
      toast.warn("Please fill all fields and select at least one day.");
      return;
    }

    if (!validateTimeRange(startTime, endTime)) return;
    
    if (!validateDateRange(startDate, endDate)) return;
    
    try {
      if (!doctorId || !token) return;
      setLoading(true);

      await Promise.all(selectedDays.map(day => 
        slotService.addSlot(
          doctorId, 
          day, 
          startTime, 
          endTime, 
          price, 
          token,
          startDate,  // Add start date
          endDate     // Add end date
        )
      ));
      
      toast.success(`Slots for ${selectedDays.length} days added successfully!`);
      setPrice(0);
      setSelectedDays([]);
      setSelectAll(false);
      setStartDate("");
      setEndDate("");
      await fetchSlots();
    } catch (error) {
      toast.error("Failed to add slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      const newSelectedDays = prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day];
      
      setSelectAll(newSelectedDays.length === daysOfWeekOrder.length);
      return newSelectedDays;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...daysOfWeekOrder]);
    }
    setSelectAll(!selectAll);
  };

  const startEditing = (slot: Slot) => {
    setEditingSlotId(slot._id);
    setEditingPrice(slot.price);
    setEditingStartTime(slot.startTime);
    setEditingEndTime(slot.endTime);
    setEditingStartDate(slot.startDate || "");
    setEditingEndDate(slot.endDate || "");
  };

  const handleUpdateSlot = async () => {
    if (!editingSlotId || !token) return;
    
    if (!validateTimeRange(editingStartTime, editingEndTime)) return;
    
    if (!validateDateRange(editingStartDate, editingEndDate)) return;
    
    try {
      await slotService.updateSlot(
        editingSlotId,
        {
          price: editingPrice,
          startTime: editingStartTime,
          endTime: editingEndTime,
          startDate: editingStartDate,
          endDate: editingEndDate,
          date: ""  // Keeping this for backward compatibility
        },
        token
      );
      toast.success("Slot updated successfully!");
      setEditingSlotId(null);
      await fetchSlots();
    } catch (error) {
      toast.error("Failed to update slot.");
    }
  };

  const handleToggleAvailability = async (slotId: string, isCurrentlyAvailable: boolean) => {
    if (!token) return;
    try {
      if (isCurrentlyAvailable) {
        await slotService.markUnavailable(slotId, token);
        toast.success("Slot marked as unavailable.");
      } else {
        await slotService.markAvailable(slotId, token);
        toast.success("Slot marked as available.");
      }
      await fetchSlots();
    } catch (error) {
      toast.error(`Failed to update slot availability.`);
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(field);
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const sortedSlots = [...slots].sort((a, b) => {
    if (sortBy === "dayOfWeek") {
      const aIndex = daysOfWeekOrder.indexOf(a.dayOfWeek);
      const bIndex = daysOfWeekOrder.indexOf(b.dayOfWeek);
      return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
    } else if (sortBy === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortBy === "startDate") {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    } else {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      return sortOrder === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSlots = sortedSlots.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSlots.length / itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-3 w-full bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Weekly Slot Management</h2>
      
      {/* Slot Creation Form with Select All */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Create Weekly Slots</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700 font-medium">Select All</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeekOrder.map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">{day}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddDefaultSlots}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200 flex justify-center items-center"
          >
            {loading ? <LoadingSpinner size="lg" /> : "Create Slots"}
          </button>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">All Weekly Slots</h3>
          <div className="text-base text-gray-500">
            {slots.length} {slots.length === 1 ? 'slot' : 'slots'} found
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No slots available</h3>
            <p className="mt-1 text-base text-gray-500">Get started by creating slots above.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("dayOfWeek")}
                    >
                      <div className="flex items-center">
                        Day
                        {sortBy === "dayOfWeek" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("startTime")}
                    >
                      <div className="flex items-center">
                        Time Slot
                        {sortBy === "startTime" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("price")}
                    >
                      <div className="flex items-center">
                        Price
                        {sortBy === "price" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("startDate")}
                    >
                      <div className="flex items-center">
                        Date Range
                        {sortBy === "startDate" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSlots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        {slot.dayOfWeek}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingSlotId === slot._id ? (
                          <div className="flex space-x-2 items-center">
                            <input
                              type="time"
                              value={editingStartTime}
                              onChange={(e) => setEditingStartTime(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-24"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={editingEndTime}
                              onChange={(e) => setEditingEndTime(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-24"
                            />
                          </div>
                        ) : (
                          <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingSlotId === slot._id ? (
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 w-24"
                            min="0"
                          />
                        ) : (
                          <div className="font-medium">
                            ₹{slot.price.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingSlotId === slot._id ? (
                          <div className="flex space-x-2 items-center">
                            <input
                              type="date"
                              value={editingStartDate}
                              min={today}
                              onChange={(e) => setEditingStartDate(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-24"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="date"
                              value={editingEndDate}
                              min={editingStartDate || today}
                              onChange={(e) => setEditingEndDate(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-24"
                            />
                          </div>
                        ) : (
                          <span>
                            {slot.startDate && slot.endDate 
                              ? `${formatDateString(slot.startDate)} - ${formatDateString(slot.endDate)}`
                              : "Not set"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slot.isAvailable 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {slot.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {editingSlotId === slot._id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={handleUpdateSlot}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSlotId(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => startEditing(slot)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleAvailability(slot._id, slot.isAvailable)}
                              className={`${
                                slot.isAvailable 
                                  ? "bg-yellow-500 hover:bg-yellow-600" 
                                  : "bg-green-500 hover:bg-green-600"
                              } text-white px-3 py-1 rounded text-sm`}
                            >
                              {slot.isAvailable ? "Make Unavailable" : "Make Available"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SlotManagement;
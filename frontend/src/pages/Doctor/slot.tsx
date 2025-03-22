import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RootState } from "../../redux/store";
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";

interface Slot {
  isAvailable: boolean;
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked";
}

const SlotManagement: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingStartTime, setEditingStartTime] = useState<string>("");
  const [editingEndTime, setEditingEndTime] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "startTime" | "price" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [minDate, setMinDate] = useState<string>("");

  const doctorId = useSelector((state: RootState) => state.doctors.doctorId);
  const token = useSelector((state: RootState) => state.doctors.token);

  useEffect(() => {
    if (doctorId) fetchSlots();
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMinDate(tomorrow.toISOString().split('T')[0]);
  }, [doctorId]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/slots/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSlots(response.data?.slots || []);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setSlots([]);
      toast.error("Failed to fetch slots.");
    }
  };

  const validateTimeRange = () => {
    if (startTime >= endTime) {
      toast.warn("End time must be after start time.");
      return false;
    }
    return true;
  };

  const validateEditTimeRange = () => {
    if (editingStartTime >= editingEndTime) {
      toast.warn("End time must be after start time.");
      return false;
    }
    return true;
  };

  const handleAddSlot = async () => {
    if (!date || !startTime || !endTime || price <= 0) {
      toast.warn("Please fill all fields correctly.");
      return;
    }

    if (!validateTimeRange()) return;

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5001/api/slots/create", 
        { doctorId, date, startTime, endTime, price },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Slot added successfully!");
      setDate("");
      setStartTime("");
      setEndTime("");
      setPrice(0);
      fetchSlots();
    } catch (error) {
      toast.error("Failed to add slot.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (slot: Slot) => {
    setEditingSlotId(slot._id);
    setEditingPrice(slot.price);
    setEditingDate(slot.date);
    setEditingStartTime(slot.startTime);
    setEditingEndTime(slot.endTime);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlotId) return;
    
    if (!validateEditTimeRange()) return;

    try {
      await axios.put(
        `http://localhost:5001/api/slots/${editingSlotId}`, 
        { 
          price: editingPrice,
          date: editingDate,
          startTime: editingStartTime,
          endTime: editingEndTime 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Slot updated successfully!");
      setEditingSlotId(null);
      fetchSlots();
    } catch (error) {
      toast.error("Failed to update slot.");
    }
  };

  const handleMarkUnavailable = async (slotId: string) => {
    try {
      await axios.put(
        `http://localhost:5001/api/slots/${slotId}/unavailable`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Slot marked as unavailable.");
      fetchSlots();
    } catch (error) {
      toast.error("Failed to mark slot as unavailable.");
    }
  };

  const handleMarkAvailable = async (slotId: string) => {
    try {
      await axios.put(
        `http://localhost:5001/api/slots/${slotId}/available`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Slot marked as available.");
      fetchSlots();
    } catch (error) {
      toast.error("Failed to mark slot as available.");
    }
  };

  const toggleSort = (field: "date" | "startTime" | "price" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedSlots = [...slots].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc" 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "startTime") {
      return sortOrder === "asc" 
        ? a.startTime.localeCompare(b.startTime)
        : b.startTime.localeCompare(a.startTime);
    } else if (sortBy === "price") {
      return sortOrder === "asc" 
        ? a.price - b.price
        : b.price - a.price;
    } else {
      return sortOrder === "asc" 
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to 12-hour format
const formatTime = (timeString: string) => {
  if (!timeString) return ""; // Add this check
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};


  return (
    <div className="p-3 w-full bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Appointment Slot Management</h2>
      
      {/* Add Slot Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Create New Slot</h3>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSlot}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center justify-center text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating
                </>
              ) : (
                "Create Slot"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slot List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">All Appointment Slots</h3>
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
            <p className="mt-1 text-base text-gray-500">Get started by creating a new appointment slot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === "date" && (
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
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === "status" && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSlots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingSlotId === slot._id ? (
                        <input
                          type="date"
                          value={editingDate}
                          min={minDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                        />
                      ) : (
                        formatDate(slot.date)
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingSlotId === slot._id ? (
                        <div className="flex space-x-2">
                          <input
                            type="time"
                            value={editingStartTime}
                            onChange={(e) => setEditingStartTime(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 w-24"
                          />
                          <span className="px-1">to</span>
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
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          min="0"
                        />
                      ) : (
                        <div className="font-medium">
                          ₹{slot.price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {slot.isAvailable ? (
                          <button
                            onClick={() => handleMarkUnavailable(slot._id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Mark Unavailable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAvailable(slot._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Mark Available
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {editingSlotId === slot._id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleUpdateSlot}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSlotId(null)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(slot)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotManagement;
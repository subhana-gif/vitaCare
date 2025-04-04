import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from 'react-toastify';

interface TimeSlotSelectorProps {
  doctorId: string;
  token: string;
  selectedDate: string;
  bookedAppointments: {
    date: string;
    time: string;
  }[];
  onSelectSlot: (slotId: string, time: string, price: number) => void;
}

interface Slot {
  _id: string;
  doctorId: string;
  date?: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  price: number;
  day?: number; // Day of week (0-6, Sunday is 0)
  status?: string;
  isAvailable?: boolean;
}

// Define a type for our processed time slots
interface ProcessedTimeSlot {
  id: string;
  time: string;
  displayTime: string;
  price: number;
  originalSlotId: string;
}
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  doctorId,
  token,
  selectedDate,
  bookedAppointments,
  onSelectSlot,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<ProcessedTimeSlot[]>([]);
  const [originalSlots, setOriginalSlots] = useState<Slot[]>([]);
  console.log("token here in user:",token)

  useEffect(() => {
    const fetchDoctorSlots = async () => {
      if (!doctorId || !selectedDate) {
        setLoading(false);
        return;
      }
  
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/slots/${doctorId}/date/${selectedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch available slots");
        }
  
        const data = await response.json();
        const { slots = [] } = data;
        
        setOriginalSlots(slots);
        
        // Process slots into 15-minute intervals
        const now = dayjs();
        const isToday = selectedDate === now.format("YYYY-MM-DD");
        
        const processedTimeSlots: ProcessedTimeSlot[] = [];
        
        slots.forEach(slot => {
          // Generate 15-minute intervals within this slot's range
          let currentTime = dayjs(`2000-01-01 ${slot.startTime}`);
          const endTime = dayjs(`2000-01-01 ${slot.endTime}`);
          
          while (currentTime.isBefore(endTime)) {
            const timeString = currentTime.format("HH:mm");
            
            // Check if this specific time is in the past (for today)
            if (isToday) {
              const slotDateTime = dayjs(`${selectedDate} ${timeString}`);
              if (slotDateTime.isBefore(now)) {
                currentTime = currentTime.add(15, "minute");
                continue;
              }
            }
            
            // Check if this specific time is already booked
            const isBooked = bookedAppointments.some(
              appointment => 
                appointment.date === selectedDate && 
                appointment.time === timeString
            );
            
            if (!isBooked) {
              processedTimeSlots.push({
                id: `${slot._id}-${timeString}`,
                time: timeString,
                displayTime: dayjs(`2000-01-01 ${timeString}`).format("h:mm A"),
                price: slot.price,
                originalSlotId: slot._id.toString() // Ensure it's a string
              });
            }
            
            currentTime = currentTime.add(15, "minute");
          }
        });
        
        setAvailableTimeSlots(processedTimeSlots);
        
        // Reset selected slot when date changes
        setSelectedSlot("");
        setSelectedTime("");
  
      } catch (error) {
        console.error("Error fetching doctor slots:", error);
        toast.error("Failed to load available time slots");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDoctorSlots();
  }, [doctorId, selectedDate, token, bookedAppointments]);
  
  const handleTimeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeId = e.target.value;
    
    if (timeId) {
      const selectedTimeSlot = availableTimeSlots.find(slot => slot.id === timeId);
      
      if (selectedTimeSlot) {
        setSelectedSlot(timeId);
        setSelectedTime(selectedTimeSlot.time);
        onSelectSlot(
          selectedTimeSlot.originalSlotId, 
          selectedTimeSlot.time, 
          selectedTimeSlot.price
        );
      }
    } else {
      setSelectedSlot("");
      setSelectedTime("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading available slots...</span>
      </div>
    );
  }

  if (availableTimeSlots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No available time slots for this date. Please select another date.</p>
      </div>
    );
  }

  // Group time slots by price for display in the UI
  const slotsByPrice: Record<string, ProcessedTimeSlot[]> = {};
  availableTimeSlots.forEach(slot => {
    const priceKey = slot.price.toString();
    if (!slotsByPrice[priceKey]) {
      slotsByPrice[priceKey] = [];
    }
    slotsByPrice[priceKey].push(slot);
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Select Time:
        </label>

        <div className="space-y-4">
          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
              Available Appointment Times
            </label>
            <select
              id="timeSlot"
              value={selectedSlot}
              onChange={handleTimeSelect}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a time</option>
              
              {/* Group times by price with optgroup */}
              {Object.entries(slotsByPrice).map(([price, slots]) => (
                <optgroup key={price} label={`₹${price}`}>
                  {slots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.displayTime}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Selected slot display */}
          {selectedSlot && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-blue-800 font-medium">
                Selected: {availableTimeSlots.find(slot => slot.id === selectedSlot)?.displayTime}
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Price: ₹{availableTimeSlots.find(slot => slot.id === selectedSlot)?.price}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;
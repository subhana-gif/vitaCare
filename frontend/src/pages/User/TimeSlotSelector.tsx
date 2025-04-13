import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from 'react-toastify';
import { slotService } from "../../services/slotService";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface TimeSlotSelectorProps {
  doctorId: string;
  token: string;
  selectedDate: string;
  bookedAppointments: { date: string; time: string }[];
  onSelectSlot: (slotId: string, time: string, price: number) => void;
}

interface Slot {
  _id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  price: number;
  isAvailable?: boolean;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface ProcessedTimeSlot {
  id: string;
  time: string;
  displayTime: string;
  price: number;
  originalSlotId: string;
  isWithinDateRange: boolean;
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<ProcessedTimeSlot[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorSlots = async () => {
      if (!doctorId || !selectedDate || !token) {
        setLoading(false);
        toast.error("Missing required information to fetch slots");
        return;
      }

      // Validate selected date
      const today = dayjs().startOf('day');
      const appointmentDate = dayjs(selectedDate).startOf('day');
      
      if (appointmentDate.isBefore(today)) {
        setDateError("Cannot select a date in the past");
        setLoading(false);
        return;
      } else {
        setDateError(null);
      }

      setLoading(true);
      try {
        const slots = await slotService.fetchSlotsByDate(doctorId, selectedDate, token);
        
        if (!Array.isArray(slots)) {
          throw new Error("Invalid slots data received");
        }

        const now = dayjs();
        const isToday = selectedDate === now.format("YYYY-MM-DD");
        const processedTimeSlots: ProcessedTimeSlot[] = [];

        slots.forEach(slot => {
          // Skip if slot is explicitly marked as unavailable
          if (slot.isAvailable === false || slot.status === "booked") {
            return;
          }

          // Check if slot is within its date range (if specified)
          const slotStartDate = slot.startDate ? dayjs(slot.startDate).startOf('day') : null;
          const slotEndDate = slot.endDate ? dayjs(slot.endDate).endOf('day') : null;
          
          const isWithinDateRange = 
          (!slotStartDate || appointmentDate.isSame(slotStartDate) || appointmentDate.isAfter(slotStartDate)) &&
          (!slotEndDate || appointmentDate.isSame(slotEndDate) || appointmentDate.isBefore(slotEndDate));
      
        if (!isWithinDateRange) {
          return;
        }
          // Generate time slots
          let currentTime = dayjs(`2000-01-01 ${slot.startTime}`);
          const endTime = dayjs(`2000-01-01 ${slot.endTime}`);

          while (currentTime.isBefore(endTime)) {
            const timeString = currentTime.format("HH:mm");
            const fullDateTime = dayjs(`${selectedDate} ${timeString}`);

            // Skip if time is in the past for today
            if (isToday && fullDateTime.isBefore(now)) {
              currentTime = currentTime.add(15, "minute");
              continue;
            }

            // Check if slot is booked
            const isBooked = bookedAppointments.some(
              appointment => 
                appointment.date === selectedDate && 
                appointment.time === timeString
            );

            if (!isBooked) {
              processedTimeSlots.push({
                id: `${slot._id}-${timeString}`,
                time: timeString,
                displayTime: currentTime.format("h:mm A"),
                price: slot.price,
                originalSlotId: slot._id.toString(),
                isWithinDateRange: true
              });
            }

            currentTime = currentTime.add(15, "minute");
          }
        });

        // Sort by time
        processedTimeSlots.sort((a, b) => a.time.localeCompare(b.time));
        
        setAvailableTimeSlots(processedTimeSlots);
        setSelectedSlot("");

      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error(
          error instanceof Error 
            ? `Failed to load slots: ${error.message}`
            : "Failed to load slots"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSlots();
  }, [doctorId, selectedDate, token, bookedAppointments]);

  const handleTimeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeId = e.target.value;
    const selectedTimeSlot = availableTimeSlots.find(slot => slot.id === timeId);
    
    if (selectedTimeSlot) {
      setSelectedSlot(timeId);
      onSelectSlot(
        selectedTimeSlot.originalSlotId, 
        selectedTimeSlot.time, 
        selectedTimeSlot.price
      );
    } else {
      setSelectedSlot("");
    }
  };

  if (dateError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{dateError}</p>
      </div>
    );
  }

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
        <p className="text-yellow-700">
          No available time slots for {dayjs(selectedDate).format("MMMM D, YYYY")}. 
          Please select another date.
        </p>
      </div>
    );
  }

  return (
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
          {availableTimeSlots.map(slot => (
            <option key={slot.id} value={slot.id}>
              {slot.displayTime} 
            </option>
          ))}
        </select>
      </div>

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
  );
};

export default TimeSlotSelector;
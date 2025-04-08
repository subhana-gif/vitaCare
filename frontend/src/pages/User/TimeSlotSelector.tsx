import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from 'react-toastify';
import { slotService } from "../../services/slotService";

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
}

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

  useEffect(() => {
    const fetchDoctorSlots = async () => {
      if (!doctorId || !selectedDate || !token) {
        console.log("Missing required props:", { doctorId, selectedDate, token });
        setLoading(false);
        toast.error("Missing required information to fetch slots");
        return;
      }

      setLoading(true);
      try {
        const dayOfWeek = dayjs(selectedDate).format("dddd");
        console.log("Fetching slots for:", { doctorId, selectedDate, dayOfWeek, token });

        const slots = await slotService.fetchSlotsByDate(doctorId, selectedDate, token);
        console.log("Raw slots from service:", slots);

        if (!Array.isArray(slots)) {
          throw new Error("Invalid slots data: Expected an array");
        }

        const relevantSlots = slots.filter(slot => slot.isAvailable !== false);
        setOriginalSlots(relevantSlots);

        const now = dayjs();
        const isToday = selectedDate === now.format("YYYY-MM-DD");
        const processedTimeSlots: ProcessedTimeSlot[] = [];

        relevantSlots.forEach(slot => {
          let currentTime = dayjs(`2000-01-01 ${slot.startTime}`);
          const endTime = dayjs(`2000-01-01 ${slot.endTime}`);

          while (currentTime.isBefore(endTime)) {
            const timeString = currentTime.format("HH:mm");

            if (isToday && dayjs(`${selectedDate} ${timeString}`).isBefore(now)) {
              currentTime = currentTime.add(15, "minute");
              continue;
            }

            const isBooked = bookedAppointments.some(
              appointment => appointment.date === selectedDate && appointment.time === timeString
            );

            if (!isBooked) {
              processedTimeSlots.push({
                id: `${slot._id}-${timeString}`,
                time: timeString,
                displayTime: dayjs(`2000-01-01 ${timeString}`).format("h:mm A"),
                price: slot.price,
                originalSlotId: slot._id.toString()
              });
            }

            currentTime = currentTime.add(15, "minute");
          }
        });

        console.log("Processed time slots:", processedTimeSlots);
        setAvailableTimeSlots(processedTimeSlots);
        setSelectedSlot("");
        setSelectedTime("");

      } catch (error) {
        console.error("Error fetching doctor slots:", error);
      
        if (error instanceof Error) {
          toast.error(`Failed to load available time slots: ${error.message}`);
        } else {
          toast.error("Failed to load available time slots: Unknown error");
        }
      }
      finally {
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
        onSelectSlot(selectedTimeSlot.originalSlotId, selectedTimeSlot.time, selectedTimeSlot.price);
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
        <label className="block text-lg font-medium text-gray-700 mb-3">Select Time:</label>
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
              {Object.entries(slotsByPrice).map(([price, slots]) => (
                <optgroup key={price} label={`₹${price}`}>
                  {slots.map(slot => (
                    <option key={slot.id} value={slot.id}>{slot.displayTime}</option>
                  ))}
                </optgroup>
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
      </div>
    </div>
  );
};

export default TimeSlotSelector;
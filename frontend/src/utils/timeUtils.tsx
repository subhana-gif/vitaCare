export const formatTime = (time: string): string => {
    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute} ${ampm}`;
  };
  
  export const validateTimeRange = (startTime: string, endTime: string): boolean => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
  
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
  
    return endTotalMinutes > startTotalMinutes;
  };
  
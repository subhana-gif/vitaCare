export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  export const isUpcoming = (dateStr: string): boolean => {
    const today = new Date().setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateStr).setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };
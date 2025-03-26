
export interface ISlotDTO {
  id?: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status?: "available" | "booked";
  isAvailable?: boolean;
}
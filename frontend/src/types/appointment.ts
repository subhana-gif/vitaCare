export interface Appointment {
    appointmentFee: any;
    status: string;
    _id: string;
    date: string;
    time: string;
    doctorId: {
      name?: string;
      speciality?: string;
      address?: string;
      imageUrl?: string;
      appointmentFee: number;
    };
    paymentStatus?: string;
    paid?: boolean;
  }
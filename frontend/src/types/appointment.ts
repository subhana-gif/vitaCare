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
    patientId: {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string;
    };    
    paymentStatus?: string;
    paid?: boolean;
  }
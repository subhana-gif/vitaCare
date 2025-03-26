import { IAppointment } from "../../models/appointment";

export interface IAppointmentService {
  bookAppointment(appointmentData: Omit<IAppointment, "_id">): Promise<IAppointment>;
  getAppointmentsByUserId(userId: string): Promise<IAppointment[]>;
  updateAppointmentStatus(appointmentId: string, status: IAppointment["status"]): Promise<IAppointment>;
  getAppointmentsByDoctor(doctorId: string): Promise<IAppointment[]>;
  getAppointmentsByPatient(patientId: string): Promise<IAppointment[]>;
  cancelAppointment(appointmentId: string): Promise<void>;
  getAllAppointments(): Promise<IAppointment[]>;
}
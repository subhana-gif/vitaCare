import { IAppointment } from "../../models/appointment";

export interface IAppointmentRepository {
    updatePaymentStatus(appointmentId: string, status: string, paymentId?: string): Promise<void>;
    findById(appointmentId: string): Promise<IAppointment | null>;
}
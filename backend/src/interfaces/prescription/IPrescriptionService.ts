import { IPrescription } from "./IPriscription";

export interface IPrescriptionService {
  createPrescription(prescriptionData: IPrescription): Promise<IPrescription>;
  getPrescriptionByAppointment(appointmentId: string): Promise<IPrescription | null>;
  updatePrescription(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null>;
  generatePdfContent(prescription: IPrescription): Promise<Buffer>;
}
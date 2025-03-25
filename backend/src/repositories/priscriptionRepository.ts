import { IPrescription, IPrescriptionRepository } from '../interfaces/IPriscription';
import Prescription from '../models/prescription.model';
import { Types } from 'mongoose';

export class PrescriptionRepository implements IPrescriptionRepository {
  async create(prescriptionData: Partial<IPrescription>): Promise<IPrescription> {
    return await Prescription.create(prescriptionData);
  }

  async findByAppointmentId(appointmentId: string): Promise<IPrescription | null> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new Error('Invalid appointment ID');
    }
    return await Prescription.findOne({ appointmentId });
  }

  async updateByAppointmentId(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new Error('Invalid appointment ID');
    }
    return await Prescription.findOneAndUpdate(
      { appointmentId },
      updateData,
      { new: true }
    );
  }
}
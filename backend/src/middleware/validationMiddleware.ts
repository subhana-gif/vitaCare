import { Request, Response, NextFunction } from 'express';

export const validateAppointmentData = (req: Request, res: Response, next: NextFunction) => {
  const { patientId, doctorId, date, time } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({
      message: 'Missing required fields',
      details: {
        patientId: !patientId ? 'Patient ID is required' : null,
        doctorId: !doctorId ? 'Doctor ID is required' : null,
        date: !date ? 'Date is required' : null,
        time: !time ? 'Time is required' : null
      }
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      message: 'Invalid date format',
      details: 'Date must be in YYYY-MM-DD format'
    });
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({
      message: 'Invalid time format',
      details: 'Time must be in HH:mm format'
    });
  }

  const appointmentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDate < today) {
    return res.status(400).json({
      message: 'Invalid date',
      details: 'Appointment date cannot be in the past'
    });
  }

  next();
};
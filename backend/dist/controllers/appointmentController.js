"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.updateAppointmentStatus = exports.getPatientAppointments = exports.getDoctorAppointments = exports.createAppointment = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const doctors_1 = __importDefault(require("../models/doctors"));
const mongoose_1 = require("mongoose");
const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time } = req.body;
        // Validate required fields
        if (!patientId || !doctorId || !date || !time) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if doctor exists and get appointment fee
        const doctor = await doctors_1.default.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        // Check if slot is available
        const existingAppointment = await appointment_1.default.findOne({
            doctorId,
            date,
            time,
            status: { $ne: 'cancelled' },
        });
        if (existingAppointment) {
            return res.status(400).json({ message: 'This slot is already booked' });
        }
        // Create new appointment
        const appointment = new appointment_1.default({
            patientId: new mongoose_1.Types.ObjectId(patientId),
            doctorId: new mongoose_1.Types.ObjectId(doctorId),
            date,
            time,
            appointmentFee: doctor.appointmentFee,
        });
        await appointment.save();
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment,
        });
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createAppointment = createAppointment;
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await appointment_1.default.find({ doctorId })
            .populate('patientId', 'name email')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    }
    catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getDoctorAppointments = getDoctorAppointments;
const getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const appointments = await appointment_1.default.find({ patientId })
            .populate('doctorId', 'name speciality imageUrl appointmentFee')
            .sort({ date: -1, time: 1 });
        res.json(appointments);
    }
    catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPatientAppointments = getPatientAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        const appointment = await appointment_1.default.findByIdAndUpdate(appointmentId, { status }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({
            message: 'Appointment status updated successfully',
            appointment,
        });
    }
    catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const updatePaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { paymentStatus } = req.body;
        const appointment = await appointment_1.default.findByIdAndUpdate(appointmentId, { paymentStatus }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({
            message: 'Payment status updated successfully',
            appointment,
        });
    }
    catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;

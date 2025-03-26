import { Request, Response } from "express";
import slotService from "../services/slotService";
import asyncHandler from "../utils/asyncHandlers";

class SlotController {
  addSlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = await slotService.addSlot(req.body);
    res.status(201).json({ message: "Slot added successfully", slot });
  });

  getSlotsByDoctorId = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const slots = await slotService.getSlotsByDoctorId(doctorId);
    res.status(200).json({ slots });
  });

  updateSlot = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const { price, date, startTime,endTime } = req.body;

    const updatedSlot = await slotService.updateSlot(slotId, { price, date, startTime, endTime });

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    res.status(200).json({ message: "Slot updated successfully!", updatedSlot });
  });

  markSlotUnavailable = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const updatedSlot = await slotService.markSlotUnavailable(slotId);

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({ message: "Slot marked as unavailable", updatedSlot });
  });

  markSlotAvailable = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const updatedSlot = await slotService.markSlotAvailable(slotId);

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({ message: "Slot marked as available", updatedSlot });
  });

  getSlotsByDoctorAndDate = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, date } = req.params;

    const slots = await slotService.getSlotsByDoctorAndDate(doctorId, date);
    if (!slots.length) {
      return res.status(404).json({ message: "No available slots found." });
    }

    res.status(200).json({ slots });
  });

  markSlotAsBooked = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const bookedSlot = await slotService.markSlotAsBooked(slotId);

    if (!bookedSlot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    res.status(200).json({ message: "Slot marked as booked.", bookedSlot });
  });
}

export default new SlotController();

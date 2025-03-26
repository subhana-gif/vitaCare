import { Request, Response } from "express";
import { ISlotService } from "../interfaces/ISlotService";
import asyncHandler from "../utils/asyncHandlers";

class SlotController {
  constructor(private slotService: ISlotService) {}

  // Add Slot
  addSlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = await this.slotService.createSlot(req.body);
    res.status(201).json({ message: "Slot added successfully", slot });
  });

  // Get Slots by Doctor ID
  getSlotsByDoctorId = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const slots = await this.slotService.getSlotsByDoctorId(doctorId);
    res.status(200).json({ slots });  
  });

  // Update Slot
  updateSlot = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const { price, date, startTime, endTime } = req.body;

    const updatedSlot = await this.slotService.updateSlot(slotId, { price, date, startTime, endTime });
    res.status(200).json({ message: "Slot updated successfully!", updatedSlot });
  });

  // Mark Slot Unavailable
  markSlotUnavailable = asyncHandler(async (req: Request, res: Response) => {
    console.log("Full URL:", req.originalUrl); 
    console.log("req:",req.params)
    const { slotId } = req.params;
    const updatedSlot = await this.slotService.markSlotUnavailable(slotId);
    res.status(200).json({ message: "Slot marked as unavailable", updatedSlot });
  });

  // Mark Slot Available
  markSlotAvailable = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const updatedSlot = await this.slotService.markSlotAvailable(slotId);
    res.status(200).json({ message: "Slot marked as available", updatedSlot });
  });

  // Get Slots by Doctor and Date
  getSlotsByDoctorAndDate = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, date } = req.params;
    const slots = await this.slotService.getSlotsByDoctorAndDate(doctorId, date);
    
    if (!slots.length) {
      return res.status(404).json({ message: "No available slots found." });
    }

    res.status(200).json({ slots });
  });

  // Mark Slot as Booked
  markSlotAsBooked = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const bookedSlot = await this.slotService.markSlotAsBooked(slotId);
    res.status(200).json({ message: "Slot marked as booked.", bookedSlot });
  });
}

export default (slotService: ISlotService) => new SlotController(slotService);
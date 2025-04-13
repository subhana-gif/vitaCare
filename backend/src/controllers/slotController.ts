import { Request, Response } from "express";
import slotService from "../services/slotService";
import asyncHandler from "../utils/asyncHandlers";
import { HttpMessage, HttpStatus } from "../enums/HttpStatus";

class SlotController {
  addSlot = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, dayOfWeek, startTime, endTime, price, startDate, endDate } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
    }

    if (!doctorId || !dayOfWeek || !startTime || !endTime || price === undefined) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
    }

    const slot = await slotService.addSlot(
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      price,
      token,
      startDate,
      endDate
    );
    
    res.status(HttpStatus.CREATED).json({ message: HttpMessage.CREATED, slot });
  });

  updateSlot = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const { price, date, startTime, endTime, startDate, endDate } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
    }

    const updatedSlot = await slotService.updateSlot(
      slotId,
      { price, date, startTime, endTime, startDate, endDate },
      token
    );

    if (!updatedSlot) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(HttpStatus.OK).json({ message: HttpMessage.OK, slot: updatedSlot });
  });

  getSlotsByDoctorId = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message:HttpMessage.UNAUTHORIZED});
    }

    const slots = await slotService.fetchSlots(doctorId, token);
    res.status(HttpStatus.OK).json({ slots });
  });

  markSlotUnavailable = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message:HttpMessage.UNAUTHORIZED });
    }

    const updatedSlot = await slotService.markSlotUnavailable(slotId, token);

    if (!updatedSlot) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(200).json({ message:HttpMessage.OK});
  });

  markSlotAvailable = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
    }

    const updatedSlot = await slotService.markSlotAvailable(slotId, token);

    if (!updatedSlot) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(HttpStatus.OK).json({ message: HttpMessage.NOT_FOUND });
  });

getSlotsByDoctorAndDate = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId, selectedDate } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
  }

  try {
    // Parse the selected date
    const date = new Date(selectedDate);
    if (isNaN(date.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid date format" });
    }

    // Get day of week from the date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get slots for this doctor and date
    const slots = await slotService.getSlotsByDoctorAndDay(
      doctorId, 
      dayOfWeek,
      date
    );

    res.status(HttpStatus.OK).json({ slots });
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      message: "Error fetching slots" 
    });
  }
});
  markSlotAsBooked = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const bookedSlot = await slotService.markSlotAsBooked(slotId);

    if (!bookedSlot) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(HttpStatus.OK).json({ message:HttpMessage.OK });
  });
}

export default new SlotController();
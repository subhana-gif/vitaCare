import { Request, Response } from "express";
import slotService from "../services/slotService";
import asyncHandler from "../utils/asyncHandlers";
import { HttpMessage, HttpStatus } from "../enums/HttpStatus";

class SlotController {
  addSlot = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, dayOfWeek, startTime, endTime, price } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.CREATED).json({ message: HttpMessage.UNAUTHORIZED });
    }

    if (!doctorId || !dayOfWeek || !startTime || !endTime || price === undefined) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST});
    }

    const slot = await slotService.addSlot(doctorId, dayOfWeek, startTime, endTime, price, token);
    res.status(HttpStatus.CREATED).json({ message: HttpMessage.CREATED});
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

  updateSlot = asyncHandler(async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const { price, startTime, endTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
    }

    const updatedSlot = await slotService.updateSlot(slotId, { price, startTime, endTime }, token);

    if (!updatedSlot) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
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

  getSlotsByDoctorAndDay = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, dayOfWeek } = req.params;

    const slots = await slotService.getSlotsByDoctorAndDay(doctorId, dayOfWeek);
    if (!slots.length) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
    }

    res.status(HttpStatus.OK).json({ slots });
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
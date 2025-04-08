import { Request, Response } from "express";
import { Types } from "mongoose";
import { CallService } from "../services/callService";
import { HttpMessage, HttpStatus } from '../enums/HttpStatus';


export class CallController {
  constructor(private callService: CallService) {}

  async getCallHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, targetId } = req.params;
      const calls = await this.callService.getCallHistory(
        new Types.ObjectId(userId),
        new Types.ObjectId(targetId)
      );
      res.status(HttpStatus.OK).json(calls);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
    }
  }
}
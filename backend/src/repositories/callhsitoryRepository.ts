import { Types } from "mongoose";
import CallHistory from "../models/callhistory";
import { ICallHistory, ICallHistoryRepository, ICallHistoryDocument } from "../interfaces/chat/IChatdpRepository";

export class CallHistoryRepository implements ICallHistoryRepository {
  async create(call: ICallHistory): Promise<ICallHistoryDocument> {
    const newCall = new CallHistory(call);
    const savedCall = await newCall.save();
    return savedCall.toObject() as ICallHistoryDocument;
  }

  async findByUsers(userId: Types.ObjectId, targetId: Types.ObjectId): Promise<ICallHistoryDocument[]> {
    const calls = await CallHistory.find({
      $or: [
        { callerId: userId, receiverId: targetId },
        { callerId: targetId, receiverId: userId },
      ],
    }).lean();
    return calls as ICallHistoryDocument[];
  }
}
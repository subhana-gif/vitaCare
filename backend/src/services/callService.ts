import { Types } from "mongoose";
import { ICallHistory, ICallHistoryRepository, ICallHistoryDocument } from "../interfaces/chat/IChatdpRepository";

export class CallService {
  constructor(private callHistoryRepository: ICallHistoryRepository) {}

  async saveCall(call: ICallHistory): Promise<ICallHistoryDocument> {
    return await this.callHistoryRepository.create(call);
  }

  async getCallHistory(userId: Types.ObjectId, targetId: Types.ObjectId): Promise<ICallHistoryDocument[]> {
    return await this.callHistoryRepository.findByUsers(userId, targetId);
  }
}
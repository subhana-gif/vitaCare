// src/interfaces/IChatRepository.ts
import { Document, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId | string;
  receiver: Types.ObjectId | string;
  text?: string;
  media?: string;
  createdAt?: Date;
}

export interface IMessageDocument extends IMessage, Document {}

export interface IChatRepository {
  saveMessage(message: IMessage): Promise<IMessageDocument>;
  getMessages(userId: string, doctorId: string): Promise<IMessageDocument[]>;
  getDoctorChatList(doctorId: string): Promise<any[]>;
}
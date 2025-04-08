import { Document, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId | string;
  receiver: Types.ObjectId | string;
  text?: string;
  media?: string;
  type?: "image" | "video" | "call";
  status?: "Missed" | "Not Answered" | "Completed";
  callDuration?: number;
  createdAt?: Date;
}

export interface ICallHistory {
  callerId: Types.ObjectId;
  receiverId: Types.ObjectId;
  type: "video" | "audio";
  status: "completed" | "missed" | "rejected" | "no_answer";
  duration?: number; // in seconds
  startedAt?: Date;
  endedAt?: Date;
}

export interface IDoctorChatSummary {
  userId: Types.ObjectId | string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
  __v?: number;
}

export interface ICallHistoryDocument extends ICallHistory, Document {
  _id: Types.ObjectId;
  __v?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallHistoryRepository {
  create(call: ICallHistory): Promise<ICallHistoryDocument>;  
  findByUsers(userId: Types.ObjectId, targetId: Types.ObjectId): Promise<ICallHistoryDocument[]>;
}

export interface IChatRepository {
  saveMessage(message: IMessage): Promise<IMessageDocument>;
  getMessages(userId: string, doctorId: string): Promise<IMessageDocument[]>;
  getDoctorChatList(doctorId: string): Promise<IDoctorChatSummary[]>;
  deleteMessage(messageId: string): Promise<boolean>;
}
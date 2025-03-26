import { IUserDocument } from "./IUser";
import {IUser} from "./IUser"

export interface IUserRepository {
  updateUser(userId: string, updatedData: Partial<IUser>): Promise<IUserDocument | null>;
  toggleBlockStatus(userId: string): Promise<IUserDocument | null>;
  findAllUsers(): Promise<IUserDocument[]>;  createUser(user: IUser): Promise<IUserDocument>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(userId: string): Promise<IUserDocument | null>;
  updatePassword(email: string, password: string): Promise<IUserDocument | null>;
}

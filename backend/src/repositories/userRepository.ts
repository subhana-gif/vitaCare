import { IUser } from "../interfaces/user/IUser";
import { IUserRepository } from "../interfaces/user/IUserRepository";
import User from "../models/user";

export default class UserRepository implements IUserRepository {
  private static instance: UserRepository;

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async createUser(user: IUser) {
    const newUser = new User(user);
    return await newUser.save();
  }

  async findByEmail(email: string) {
    return await User.findOne({ email }).exec();
  }

  async findById(userId: string) {
    return await User.findById(userId).exec();
  }

  async updateUser(userId: string, updatedData: Partial<IUser>) {
    return await User.findByIdAndUpdate(userId, updatedData, { new: true }).exec();
  }

  async updatePassword(email: string, hashedPassword: string) {
    return await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    ).exec();
  }

  async toggleBlockStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    return user;
  }

  async findAllUsers() {
    return await User.find().exec();
  }
}

// Export the singleton instance as the default export

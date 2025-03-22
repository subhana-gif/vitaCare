"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
class UserRepository {
    constructor() { }
    static getInstance() {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }
    async createUser(user) {
        const newUser = new user_1.default(user);
        return await newUser.save();
    }
    async findByEmail(email) {
        return await user_1.default.findOne({ email }).exec();
    }
    async findById(userId) {
        return await user_1.default.findById(userId).exec();
    }
    async updateUser(userId, updatedData) {
        return await user_1.default.findByIdAndUpdate(userId, updatedData, { new: true }).exec();
    }
    async updatePassword(email, hashedPassword) {
        return await user_1.default.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true }).exec();
    }
    async toggleBlockStatus(userId) {
        const user = await user_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        return user;
    }
    async findAllUsers() {
        return await user_1.default.find().exec();
    }
}
exports.default = UserRepository;
// Export the singleton instance as the default export

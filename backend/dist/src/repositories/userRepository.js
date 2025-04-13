"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new user_1.default(user);
            return yield newUser.save();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findOne({ email }).exec();
        });
    }
    findById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findById(userId).exec();
        });
    }
    updateUser(userId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findByIdAndUpdate(userId, updatedData, { new: true }).exec();
        });
    }
    updatePassword(email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true }).exec();
        });
    }
    toggleBlockStatus(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            user.isBlocked = !user.isBlocked;
            yield user.save();
            return user;
        });
    }
    findAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.find().exec();
        });
    }
}
exports.default = UserRepository;

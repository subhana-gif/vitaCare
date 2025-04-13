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
exports.CallHistoryRepository = void 0;
const callhistory_1 = __importDefault(require("../models/callhistory"));
class CallHistoryRepository {
    create(call) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCall = new callhistory_1.default(call);
            const savedCall = yield newCall.save();
            return savedCall.toObject();
        });
    }
    // Add this in your CallHistoryRepository
    findByUsers(userId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const calls = yield callhistory_1.default.find({
                $or: [
                    { callerId: userId, receiverId: targetId },
                    { callerId: targetId, receiverId: userId },
                ],
            }).lean();
            return calls;
        });
    }
}
exports.CallHistoryRepository = CallHistoryRepository;

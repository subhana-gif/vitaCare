"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const NotificationSchema = new mongoose_1.Schema({
    recipientId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    recipientRole: { type: String, enum: ["user", "doctor", "admin"], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
NotificationSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const notificationModel = this.constructor;
            const notificationCount = yield notificationModel.countDocuments({
                recipientId: this.recipientId,
            });
            if (notificationCount >= 5) {
                const oldestNotification = yield notificationModel
                    .findOne({ recipientId: this.recipientId })
                    .sort({ createdAt: 1 });
                if (oldestNotification) {
                    yield notificationModel.deleteOne({ _id: oldestNotification._id });
                }
            }
            next(); // Proceed with saving the new notification
        }
        catch (error) {
            console.error("Error in pre-save hook:", error);
            next(error instanceof Error ? error : new Error("Failed in pre-save hook"));
        }
    });
});
const Notification = mongoose_1.default.model("Notification", NotificationSchema);
exports.default = Notification;

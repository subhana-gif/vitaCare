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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const NotificationSchema = new mongoose_1.Schema({
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, "Recipient ID is required"],
        refPath: "recipientRole" // Dynamically reference based on role
    },
    recipientRole: {
        type: String,
        enum: ["user", "doctor", "admin"],
        required: [true, "Recipient role is required"]
    },
    message: {
        type: String,
        required: [true, "Message cannot be empty"],
        minlength: [3, "Message must be at least 3 characters long"],
        maxlength: [500, "Message cannot exceed 500 characters"]
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
// Ensure recipientId matches the recipientRole model
NotificationSchema.pre("save", async function (next) {
    const roleModelMap = {
        user: "User",
        doctor: "Doctor",
        admin: "Admin"
    };
    const modelName = roleModelMap[this.recipientRole];
    const exists = await mongoose_1.default.model(modelName).exists({ _id: this.recipientId });
    if (!exists) {
        return next(new Error(`${this.recipientRole} with ID ${this.recipientId} does not exist`));
    }
    next();
});
const Notification = mongoose_1.default.model("Notification", NotificationSchema);
exports.default = Notification;

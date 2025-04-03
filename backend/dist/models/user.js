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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // For password hashing
const UserSchema = new mongoose_1.Schema({
    name: { type: String, trim: true },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Email format validation
    },
    password: { type: String, required: true, minlength: 6 }, // Added password length validation
    phone: {
        type: String,
        unique: true,
        sparse: true, // Optional, no need to be unique if some users don't have phone numbers
    },
    address: { type: String, trim: true },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    dob: { type: Date },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true });
// Password hashing before saving the user
UserSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = await bcryptjs_1.default.hash(this.password, 10);
    }
    next();
});
// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Indexing fields for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
// User model
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;

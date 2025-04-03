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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const doctorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Doctor name is required"],
        trim: true,
        minlength: [3, "Doctor name must be at least 3 characters long"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
        type: String,
        default: null,
        validate: {
            validator: function (value) {
                return value === null || value.length >= 6;
            },
            message: "Password must be at least 6 characters long",
        },
    },
    speciality: {
        type: String,
        required: [true, "Speciality is required"],
        trim: true,
    },
    degree: {
        type: String,
        required: [true, "Degree is required"],
    },
    experience: {
        type: String,
        required: [true, "Experience is required"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    appointmentFee: {
        type: Number,
        required: [true, "Appointment fee is required"],
        min: [1, "Appointment fee must be a positive number"],
    },
    about: {
        type: String,
        default: "",
        trim: true,
    },
    imageUrl: {
        type: String,
        default: "",
        validate: {
            validator: function (value) {
                return value === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))$/.test(value);
            },
            message: "Invalid image URL",
        },
    },
    available: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
// Virtual field for slots
doctorSchema.virtual("slots", {
    ref: "Slot",
    localField: "_id",
    foreignField: "doctorId",
});
// Password hashing middleware
doctorSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        this.password = await bcryptjs_1.default.hash(this.password, 10);
    }
    next();
});
const Doctor = mongoose_1.default.model("Doctor", doctorSchema);
exports.default = Doctor;

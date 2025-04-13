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
const medicineSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Medicine name is required"],
        trim: true,
    },
    dosage: {
        type: String,
        required: [true, "Dosage is required"],
        trim: true,
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
        trim: true,
    },
    timing: {
        type: String,
        required: [true, "Timing is required"],
        trim: true,
    },
    instructions: {
        type: String,
        trim: true,
    },
}, { _id: false });
const prescriptionSchema = new mongoose_1.Schema({
    appointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Appointment",
        required: [true, "Appointment reference is required"],
    },
    medicines: {
        type: [medicineSchema],
        validate: {
            validator: (medicines) => medicines.length > 0,
            message: "At least one medicine is required",
        },
    },
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required"],
        minlength: [5, "Diagnosis must be at least 5 characters long"],
        trim: true,
    },
    notes: {
        type: String,
        maxlength: [500, "Notes cannot exceed 500 characters"],
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
    toObject: {
        virtuals: true,
    },
});
// 🔍 Static method to find a prescription by `appointmentId`
prescriptionSchema.statics.findByAppointmentId = function (appointmentId) {
    return this.findOne({ appointmentId });
};
// ⚡ Ensuring `appointmentId` is unique for faster lookups
prescriptionSchema.index({ appointmentId: 1 }, { unique: true });
// ✅ Middleware: Ensures `appointmentId` exists before saving
prescriptionSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const Appointment = mongoose_1.default.model("Appointment");
        const exists = yield Appointment.exists({ _id: this.appointmentId });
        if (!exists) {
            return next(new Error(`Appointment with ID ${this.appointmentId} does not exist`));
        }
        next();
    });
});
const Prescription = mongoose_1.default.model("Prescription", prescriptionSchema);
exports.default = Prescription;

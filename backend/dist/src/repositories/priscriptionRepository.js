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
exports.PrescriptionRepository = void 0;
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const mongoose_1 = require("mongoose");
class PrescriptionRepository {
    create(prescriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const prescription = new prescription_model_1.default(prescriptionData);
            return yield prescription.save();
        });
    }
    findByAppointmentId(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
                throw new Error("Invalid appointment ID");
            }
            return yield prescription_model_1.default.findOne({ appointmentId });
        });
    }
    updateByAppointmentId(appointmentId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
                throw new Error("Invalid appointment ID");
            }
            return yield prescription_model_1.default.findOneAndUpdate({ appointmentId }, updateData, { new: true });
        });
    }
}
exports.PrescriptionRepository = PrescriptionRepository;

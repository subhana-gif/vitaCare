"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorRepository = void 0;
const doctors_1 = __importDefault(require("../models/doctors"));
class DoctorRepository {
    async create(doctorData) {
        const doctor = new doctors_1.default(doctorData);
        return await doctor.save();
    }
    async findByEmail(email) {
        return doctors_1.default.findOne({ email }).exec();
    }
    async findById(id) {
        return doctors_1.default.findById(id).exec();
    }
    async findAll() {
        return doctors_1.default.find().exec();
    }
    async update(id, updateData) {
        return doctors_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).exec();
    }
    async delete(id) {
        await doctors_1.default.findByIdAndDelete(id).exec();
    }
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
}
exports.DoctorRepository = DoctorRepository;

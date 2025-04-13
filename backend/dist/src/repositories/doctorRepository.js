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
exports.DoctorRepository = void 0;
const doctors_1 = __importDefault(require("../models/doctors"));
class DoctorRepository {
    create(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = new doctors_1.default(doctorData);
            return yield doctor.save();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctors_1.default.findOne({ email }).exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctors_1.default.findById(id).exec();
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return doctors_1.default.find().exec();
        });
    }
    update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctors_1.default.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            }).exec();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield doctors_1.default.findByIdAndDelete(id).exec();
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, { status });
        });
    }
}
exports.DoctorRepository = DoctorRepository;

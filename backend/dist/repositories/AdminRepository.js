"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = __importDefault(require("../models/Admin"));
class AdminRepository {
    async findByEmail(email) {
        return Admin_1.default.findOne({ email });
    }
    async createAdmin(email, password) {
        const admin = new Admin_1.default({ email, password });
        return admin.save();
    }
}
exports.default = new AdminRepository();

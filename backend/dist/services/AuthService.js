"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminRepository_1 = __importDefault(require("repositories/AdminRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    static login(email, password) {
        throw new Error("Method not implemented.");
    }
    static async seedAdmin() {
        const existingAdmin = await AdminRepository_1.default.findByEmail("admin@gmail.com");
        if (!existingAdmin) {
            const hashedPassword = await bcrypt_1.default.hash("admin123", 10);
            await AdminRepository_1.default.createAdmin("admin@gmail.com", hashedPassword);
            console.log("Admin seeded successfully!");
        }
    }
    async login(email, password) {
        const admin = await AdminRepository_1.default.findByEmail(email);
        if (!admin)
            throw new Error("Invalid Credentials");
        const isMatch = await bcrypt_1.default.compare(password, admin.password);
        if (!isMatch)
            throw new Error("Invalid Credentials");
        return jsonwebtoken_1.default.sign({ id: admin.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    }
}
exports.default = AuthService; // Export the class

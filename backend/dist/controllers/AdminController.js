"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AdminService_1 = __importDefault(require("../services/AdminService"));
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const token = await this.authService.login(email, password);
                res.json({ token });
            }
            catch (error) {
                res.status(401).json({ message: "Invalid Credentials" });
            }
        };
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController(AdminService_1.default);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const specialityController_1 = __importDefault(require("../controllers/specialityController"));
const specialityController_2 = __importDefault(require("../controllers/specialityController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = (0, express_1.Router)();
router.post("/login", (0, validationMiddleware_1.validate)(), AdminController_1.default.login);
router.get("/specialities", specialityController_1.default.getAllSpecialities);
router.get("/specialities/status", specialityController_2.default.specialityStatus);
router.post("/specialities", (0, authMiddleware_1.verifyToken)(["admin"]), specialityController_1.default.addSpeciality);
router.put("/specialities/:id/toggle", (0, authMiddleware_1.verifyToken)(["admin"]), specialityController_1.default.toggleSpecialityStatus);
exports.default = router;

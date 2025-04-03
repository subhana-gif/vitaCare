"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const slotController_1 = __importDefault(require("../controllers/slotController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/create", (0, authMiddleware_1.verifyToken)(["doctor"]), slotController_1.default.addSlot);
router.get("/:doctorId", (0, authMiddleware_1.verifyToken)(["doctor"]), slotController_1.default.getSlotsByDoctorId);
router.put("/:slotId", (0, authMiddleware_1.verifyToken)(["doctor"]), slotController_1.default.updateSlot);
router.put("/:slotId/unavailable", (0, authMiddleware_1.verifyToken)(["doctor"]), slotController_1.default.markSlotUnavailable);
router.put("/:slotId/available", (0, authMiddleware_1.verifyToken)(["doctor"]), slotController_1.default.markSlotAvailable);
router.get("/:doctorId/date/:date", (0, authMiddleware_1.verifyToken)(["user"]), slotController_1.default.getSlotsByDoctorAndDate);
router.put("/:slotId/book", (0, authMiddleware_1.verifyToken)(["user"]), slotController_1.default.markSlotAsBooked);
exports.default = router;

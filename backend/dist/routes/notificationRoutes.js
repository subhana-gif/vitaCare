"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const router = express_1.default.Router();
// Routes for notifications
router.get("/", notificationController_1.default.getNotifications);
router.post("/", notificationController_1.default.createNotification);
router.put("/read-all", notificationController_1.default.markAllAsRead);
router.patch("/:id/read", notificationController_1.default.markAsRead);
exports.default = router;

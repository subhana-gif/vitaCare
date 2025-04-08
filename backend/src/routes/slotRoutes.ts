import express from "express";
import slotController from "../controllers/slotController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create",verifyToken(["doctor"]), slotController.addSlot);
router.get("/:doctorId",verifyToken(["doctor"]), slotController.getSlotsByDoctorId);
router.put("/:slotId", verifyToken(["doctor"]), slotController.updateSlot);
router.put("/:slotId/unavailable",verifyToken(["doctor"]), slotController.markSlotUnavailable);
router.put("/:slotId/available", verifyToken(["doctor"]),slotController.markSlotAvailable);
router.get("/:doctorId/day/:dayOfWeek", verifyToken(["user"]),slotController.getSlotsByDoctorAndDay);
router.put("/:slotId/book", verifyToken(["user"]), slotController.markSlotAsBooked);

export default router;
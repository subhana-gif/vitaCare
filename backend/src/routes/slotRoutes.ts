import express from "express";
import slotController from "../controllers/slotController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create",verifyToken(["doctor"]), slotController.addSlot);
router.get("/:doctorId",verifyToken(["doctor"]), slotController.getSlotsByDoctorId);
router.put("/:slotId", verifyToken(["doctor"]), slotController.updateSlot);
router.put("/:slotId/unavailable", slotController.markSlotUnavailable);
router.put("/:slotId/available", slotController.markSlotAvailable);
router.get("/:doctorId/date/:date", slotController.getSlotsByDoctorAndDate);
router.put("/:slotId/book", verifyToken(["patient"]), slotController.markSlotAsBooked);

export default router;

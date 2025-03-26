import express from "express";
import slotController from "../controllers/slotController";
import slotService from "../services/slotService"; 
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();


const slotControllerInstance = slotController(slotService);

router.post("/create", verifyToken(["doctor"]), slotControllerInstance.addSlot);
router.get("/:doctorId", verifyToken(["doctor"]), slotControllerInstance.getSlotsByDoctorId);
router.put("/:slotId", verifyToken(["doctor"]), slotControllerInstance.updateSlot);
router.put("/:slotId/unavailable", verifyToken(["doctor"]), slotControllerInstance.markSlotUnavailable);
router.put("/:slotId/available", verifyToken(["doctor"]), slotControllerInstance.markSlotAvailable);
router.get("/:doctorId/date/:date", verifyToken(["user"]), slotControllerInstance.getSlotsByDoctorAndDate);
router.put("/:slotId/book", verifyToken(["user"]), slotControllerInstance.markSlotAsBooked);

export default router;
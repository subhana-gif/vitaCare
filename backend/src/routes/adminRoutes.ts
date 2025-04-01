import { Router } from "express";
import AuthController from "../controllers/AdminController";
import SpecialityController from "../controllers/specialityController";
import specialityController from "../controllers/specialityController";
import { verifyToken } from "../middleware/authMiddleware";
import {validate} from "../middleware/validationMiddleware"

const router = Router();

router.post("/login", validate(),AuthController.login);
router.get("/specialities",SpecialityController.getAllSpecialities);
router.get("/specialities/status",specialityController.specialityStatus);

router.post("/specialities", verifyToken(["admin"]),SpecialityController.addSpeciality);
router.put("/specialities/:id/toggle",verifyToken(["admin"]), SpecialityController.toggleSpecialityStatus);
export default router;


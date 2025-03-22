import { Router } from "express";
import AuthController from "../controllers/AdminController";
import SpecialityController from "../controllers/specialityController";
import specialityController from "../controllers/specialityController";

const router = Router();

router.post("/login", AuthController.login);
router.post("/specialities", SpecialityController.addSpeciality);
router.get("/specialities", SpecialityController.getAllSpecialities);
router.put("/specialities/:id/toggle", SpecialityController.toggleSpecialityStatus);  // ✅ Toggle route added
router.get("/specialities/status",specialityController.specialityStatus);
export default router;


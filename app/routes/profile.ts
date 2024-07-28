import { Router } from "express";
import ProfileController from "../controllers/profile.controller";
import { authToken } from "../middlewares/authToken";

const router = Router();

router.get("/get-me", authToken, ProfileController.getProfile);

export default router;

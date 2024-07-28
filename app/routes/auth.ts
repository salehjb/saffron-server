import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/check-otp", AuthController.checkOtp);
router.post("/refresh-token", AuthController.refreshToken);

export default router;

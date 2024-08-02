import { Router } from "express";
import { justAdmin } from "../middlewares/justAdmin";
// routes
import authRouter from "./auth";
import profileRouter from "./profile";
import adminRouter from "./admin.router";
import productRouter from "./product";

const router = Router();

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/admin", justAdmin, adminRouter);
router.use("/product", productRouter);

export default router;

import { Router } from "express";
import { justAdmin } from "../middlewares/justAdmin";
import { authToken } from "../middlewares/authToken";
// routes
import authRouter from "./auth";
import profileRouter from "./profile";
import adminRouter from "./admin/admin.router";
import productRouter from "./product";
import cartRouter from "./cart";
import userRouter from "./user/user.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/admin", justAdmin, adminRouter);
router.use("/products", productRouter);
router.use("/cart", authToken, cartRouter);
router.use("/user", authToken, userRouter);

export default router;

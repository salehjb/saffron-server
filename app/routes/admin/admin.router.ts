import { Router } from "express";
// routes
import adminProductRouter from "./product.admin";
import adminUserRouter from "./user.admin";
import adminCategoryRouter from "./category.admin";
import adminOrderRouter from "./order.admin";

const router = Router();

router.use("/products", adminProductRouter);
router.use("/users", adminUserRouter);
router.use("/categories", adminCategoryRouter);
router.use("/orders", adminOrderRouter);

export default router;

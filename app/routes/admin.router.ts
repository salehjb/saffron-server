import { Router } from "express";
// routes
import adminProductRouter from "./admin/product.admin";
import adminUserRouter from "./admin/user.admin";
import adminCategoryRouter from "./admin/category.admin";

const router = Router();

router.use("/products", adminProductRouter);
router.use("/users", adminUserRouter);
router.use("/categories", adminCategoryRouter);

export default router;

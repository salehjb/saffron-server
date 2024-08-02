import { Router } from "express";
import AdminCategoryController from "../../controllers/admin/category.admin.controller";

const router = Router();

router.get("/", AdminCategoryController.get);
router.post("/create", AdminCategoryController.create);
router.delete("/delete/:id", AdminCategoryController.delete);
router.put("/update/:id", AdminCategoryController.update);

export default router;

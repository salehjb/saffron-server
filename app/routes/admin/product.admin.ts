import { Router } from "express";
import ProductAdminController from "../../controllers/admin/product.admin.controller";
import { uploadPermission } from "../../middlewares/uploadPermision";

const router = Router();

router.get("/get", ProductAdminController.get);
router.post(
  "/create",
  uploadPermission({ field_name: "image", max_files: 1 }),
  ProductAdminController.create
);
router.delete("/delete/:id", ProductAdminController.delete);
router.put("/update/:id", ProductAdminController.update);

export default router;

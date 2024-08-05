import { Router } from "express";
import ProductAdminController from "../../controllers/admin/product.admin.controller";
import { uploadPermission } from "../../middlewares/uploadPermision";

const router = Router();

router.get("/", ProductAdminController.get);
router.post(
  "/create",
  uploadPermission({ field_name: "image", max_files: 1 }),
  ProductAdminController.create
);
router.delete("/delete/:id", ProductAdminController.delete);
router.put(
  "/update/:id",
  uploadPermission({
    field_name: "image",
    max_files: 1,
    upload_required: false,
  }),
  ProductAdminController.update
);
router.patch("/change-is-active/:id", ProductAdminController.changeIsActive);

export default router;

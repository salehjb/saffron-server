import { Router } from "express";
import UserAdminController from "../../controllers/admin/user.admin.controller";

const router = Router();

router.get("/", UserAdminController.get);
router.put("/edit/:id", UserAdminController.editUser);

export default router;

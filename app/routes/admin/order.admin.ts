import { Router } from "express";
import OrderAdminController from "../../controllers/admin/order.admin.controller";

const router = Router();

router.get("/", OrderAdminController.get);

export default router;

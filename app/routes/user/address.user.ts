import { Router } from "express";
import UserAddressController from "../../controllers/user/address.user.controller";

const router = Router();

router.get("/", UserAddressController.get);
router.post("/create", UserAddressController.create);
router.delete("/remove/:addressId", UserAddressController.remove);

export default router;

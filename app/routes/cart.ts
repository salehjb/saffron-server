import { Router } from "express";
import CartController from "../controllers/cart.controller";

const router = Router();

router.get("/", CartController.get);
router.post("/add/:productId", CartController.add);
router.post("/decrease/:productId", CartController.decrease);
router.delete("/remove/:cartItemId", CartController.remove);

export default router;

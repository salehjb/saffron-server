import { Router } from "express";
import ProductController from "../controllers/product.controller";

const router = Router();

router.get("/", ProductController.get);

export default router;

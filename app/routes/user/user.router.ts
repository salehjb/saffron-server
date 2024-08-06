import { Router } from "express";
// routes
import userAddressRouter from "./address.user";

const router = Router();

router.use("/addresses", userAddressRouter);

export default router;

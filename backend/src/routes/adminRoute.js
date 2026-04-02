import express from "express";
import { approveUser, declineUser } from "../controllers/adminController.js";

const router = express.Router();

// These are public because they rely on secure tokens
router.get("/approve", approveUser);
router.get("/decline", declineUser);

export default router;

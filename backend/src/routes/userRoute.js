import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { convertToInterviewer } from "../controllers/userController.js";

const router = express.Router();

router.patch("/convert", protectRoute, convertToInterviewer);

export default router;

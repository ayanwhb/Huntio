import express from "express";
import { getMe, updateMe } from "../controllers/users.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.middleware.js";

const router = express.Router();
router.use(authenticateToken);

router.patch("/me", getMe);

router.get("/me", updateMe);

export default router;

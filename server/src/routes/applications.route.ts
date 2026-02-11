import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware.js";
import { createApplication, deleteApplication, getAllApplications, updateApplication } from "../controllers/applications.controller.js";

const router = express.Router();
router.use(authenticateToken);

router.post("/", createApplication);

router.delete("/:id", deleteApplication);

router.patch("/:id", updateApplication);

router.get("/", getAllApplications);

export default router;

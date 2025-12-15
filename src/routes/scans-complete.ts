import express from "express";
import { completeScan } from "../controllers/scans-controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:id/complete", requireAuth, completeScan);

export default router;

import express from "express";
import {
  deleteScan,
  getScan,
  updateScan,
} from "../controllers/scans-controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:id", requireAuth, getScan);
router.patch("/:id", requireAuth, updateScan);
router.delete("/:id", requireAuth, deleteScan);

export default router;

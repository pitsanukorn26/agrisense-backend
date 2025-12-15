import express from "express";
import {
  listScans,
  deleteScan,
  getScan,
  updateScan,
} from "../controllers/scans-controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, listScans);
router.get("/:id", requireAuth, getScan);
router.patch("/:id", requireAuth, updateScan);
router.delete("/:id", requireAuth, deleteScan);

export default router;

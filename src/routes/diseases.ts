import express from "express";
import {
  getDisease,
  listDiseases,
} from "../controllers/diseases-controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, listDiseases);
router.get("/:id", requireAuth, getDisease);

export default router;

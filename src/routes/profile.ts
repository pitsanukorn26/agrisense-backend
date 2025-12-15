import express from "express";
import multer from "multer";
import { uploadAvatar } from "../controllers/profile-controller.js";
import { requireAuth } from "../middlewares/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const router = express.Router();

router.post("/avatar", requireAuth, upload.single("file"), uploadAvatar);

export default router;

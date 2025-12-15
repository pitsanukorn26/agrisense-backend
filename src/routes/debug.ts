import express from "express";
import { getLogs } from "../utils/request-log.js";

const router = express.Router();

router.get("/logs", (req, res) => {
  const token = process.env.DEBUG_LOG_TOKEN;
  if (token && req.header("x-debug-token") !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const data = getLogs(limit);
  res.json({ data });
});

export default router;

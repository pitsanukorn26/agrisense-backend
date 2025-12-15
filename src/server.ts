import "dotenv/config";
import express from "express";
import cors from "cors";
import scansRouter from "./routes/scans.js";
import scansCompleteRouter from "./routes/scans-complete.js";
import profileRouter from "./routes/profile.js";
import diseasesRouter from "./routes/diseases.js";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./utils/errors.js";

const app = express();

const allowed = process.env.ALLOWED_ORIGIN?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: allowed && allowed.length ? allowed : "*" }));

app.use(express.json({ limit: "10mb" }));

app.use("/api/health", healthRouter);
app.use("/api/scans", scansRouter);
app.use("/api/scans", scansCompleteRouter);
app.use("/api/profile", profileRouter);
app.use("/api/diseases", diseasesRouter);

// Simple landing info for root path
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    name: "agrisense-backend",
    health: "/api/health",
    docs: "See README.md for endpoints",
  })
);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

const port = Number(process.env.PORT || 3001);
app.listen(port, () =>
  console.log(`Backend running on http://localhost:${port}`)
);

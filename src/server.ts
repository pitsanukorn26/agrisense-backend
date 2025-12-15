import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import cors from "cors";
import { connectDb } from "./db.js";
import { ScanModel } from "./models/Scan.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

const allowed = process.env.ALLOWED_ORIGIN?.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed && allowed.length ? allowed : "*" }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const normalizeScan = (scan: any) => {
  const { _id, ...rest } = scan;
  return { id: _id.toString(), ...rest };
};

// GET /api/scans/:id
app.get("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid scan id" });
  }

  const scan = await ScanModel.findById(id).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });

  res.json({ data: normalizeScan(scan) });
});

// PATCH /api/scans/:id
const updateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  failureReason: z.string().optional(),
  processedAt: z.coerce.date().optional(),
  result: z
    .object({
      diseaseId: z.string().optional(),
      label: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
      notes: z.string().optional(),
      secondaryFindings: z
        .array(
          z.object({
            label: z.string(),
            confidence: z.number().min(0).max(1).optional(),
          })
        )
        .optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  rawModelOutput: z.unknown().optional(),
});

app.patch("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid scan id" });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const d = parsed.data;
  const update: Record<string, unknown> = {};

  if (d.status !== undefined) update["status"] = d.status;
  if (d.failureReason !== undefined) update["failureReason"] = d.failureReason;
  if (d.processedAt !== undefined) update["processedAt"] = d.processedAt;
  if (d.metadata !== undefined) update["metadata"] = d.metadata;
  if (d.rawModelOutput !== undefined) update["rawModelOutput"] = d.rawModelOutput;

  // dot notation to avoid overwriting entire result object
  if (d.result) {
    if (d.result.label !== undefined) update["result.label"] = d.result.label;
    if (d.result.confidence !== undefined) update["result.confidence"] = d.result.confidence;
    if (d.result.notes !== undefined) update["result.notes"] = d.result.notes;
    if (d.result.secondaryFindings !== undefined)
      update["result.secondaryFindings"] = d.result.secondaryFindings;
    if (d.result.diseaseId !== undefined) update["result.disease"] = d.result.diseaseId;
  }

  const scan = await ScanModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();

  if (!scan) return res.status(404).json({ error: "Scan not found" });

  res.json({ message: "Scan updated", data: normalizeScan(scan) });
});

// DELETE /api/scans/:id
app.delete("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid scan id" });
  }

  const scan = await ScanModel.findByIdAndDelete(id).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });

  res.json({ message: "Scan deleted" });
});

// POST /api/scans/:id/complete
const completeSchema = z.object({
  label: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  severity: z.string().optional(),
  severityLocal: z.string().optional(),
  localeDisease: z.string().optional(),
  rawModelOutput: z.unknown().optional(),
  processedAt: z.coerce.date().optional(),
});

app.post("/api/scans/:id/complete", async (req, res) => {
  await connectDb();
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid scan id" });
  }

  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const d = parsed.data;
  const update: Record<string, unknown> = {
    status: "completed",
    processedAt: d.processedAt ?? new Date(),
  };

  // Only set result fields if provided (avoid writing undefined)
  const result: Record<string, unknown> = {};
  if (d.label !== undefined) result["label"] = d.label;
  if (d.confidence !== undefined) result["confidence"] = d.confidence;
  if (d.notes !== undefined) result["notes"] = d.notes;
  if (Object.keys(result).length) update["result"] = result;

  const metadata: Record<string, unknown> = {};
  if (d.localeDisease !== undefined) metadata["localeDisease"] = d.localeDisease;
  if (d.severity !== undefined) metadata["severity"] = d.severity;
  if (d.severityLocal !== undefined) metadata["severityLocal"] = d.severityLocal;
  if (Object.keys(metadata).length) update["metadata"] = metadata;

  if (d.rawModelOutput !== undefined) update["rawModelOutput"] = d.rawModelOutput;

  const scan = await ScanModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean() as any;

  if (!scan) return res.status(404).json({ error: "Scan not found" });

  res.json({
    message: "Scan completed",
    data: {
      id: scan._id.toString(),
      status: scan.status,
      processedAt: scan.processedAt,
      result: scan.result,
      metadata: scan.metadata,
    },
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));

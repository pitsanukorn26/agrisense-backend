import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDb } from "./db";
import { ScanModel } from "./models/Scan";
import { UserModel } from "./models/User";
import { ReportModel } from "./models/Report";
import { uploadBuffer } from "./services/storage-service";

const serializeScan = (scan: any) => {
  if (!scan) return null;
  const metaRaw = scan?.metadata;
  const metadata =
    metaRaw instanceof Map ? Object.fromEntries(metaRaw.entries()) : metaRaw || {};

  const label =
    scan?.label ||
    scan?.result?.label ||
    metadata?.localeDisease ||
    metadata?.diseaseLocal ||
    null;

  const diseaseLocal =
    scan?.diseaseLocal ||
    metadata?.localeDisease ||
    metadata?.diseaseLocal ||
    label ||
    null;

  const severity = metadata?.severity || metadata?.severityLocal || scan?.result?.severity || null;
  const confidence =
    typeof scan?.confidence === "number"
      ? scan.confidence
      : typeof scan?.result?.confidence === "number"
      ? Math.round(scan.result.confidence * 100)
      : null;

  return {
    id: scan._id?.toString?.() ?? scan.id ?? "",
    ...scan,
    metadata,
    label,
    diseaseLocal,
    severity,
    confidence,
  };
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

const updateScanSchema = z.object({
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
        .array(z.object({ label: z.string(), confidence: z.number().min(0).max(1).optional() }))
        .optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  rawModelOutput: z.unknown().optional(),
});

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "backend alive" });
});

app.get("/api/scans", async (req, res) => {
  await connectDb();
  const { status, userId, limit = "20" } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  const lim = Math.min(parseInt(limit || "20", 10) || 20, 100);
  const scans = await ScanModel.find(filter).sort({ createdAt: -1 }).limit(lim).lean();
  res.json({ data: scans.map(serializeScan) });
});

app.post("/api/scans", async (req, res) => {
  await connectDb();
  const body = req.body || {};
  if (body.userId && !mongoose.isValidObjectId(body.userId)) return res.status(400).json({ error: "Invalid user id" });
  if (typeof body.imageUrl !== "string" || !body.imageUrl) return res.status(400).json({ error: "Invalid image" });
  const scan = await ScanModel.create({
    imageUrl: body.imageUrl,
    thumbnailUrl: body.thumbnailUrl,
    user: body.userId,
    location: body.location,
    metadata: body.metadata,
    capturedAt: body.capturedAt,
    modelVersion: body.modelVersion,
  });
  res.status(201).json({ message: "Scan queued", data: { id: scan._id.toString(), status: scan.status, createdAt: scan.createdAt } });
});

app.get("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid scan id" });
  const scan = await ScanModel.findById(id).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json({ data: serializeScan(scan) });
});

app.patch("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid scan id" });
  const parsed = updateScanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  const update: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.status) update.status = d.status;
  if (d.failureReason) update.failureReason = d.failureReason;
  if (d.processedAt) update.processedAt = d.processedAt;
  if (d.metadata) update.metadata = d.metadata;
  if (d.rawModelOutput !== undefined) update.rawModelOutput = d.rawModelOutput;
  if (d.result) {
    const { diseaseId, ...rest } = d.result;
    update.result = { ...rest, disease: diseaseId };
    if (rest.label) update.label = rest.label;
    if (rest.notes) update.notes = rest.notes;
    if (typeof rest.confidence === "number") {
      update.confidence = Math.round(rest.confidence * 100);
    }
  }
  const scan = await ScanModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json({ message: "Scan updated", data: serializeScan(scan) });
});

app.delete("/api/scans/:id", async (req, res) => {
  await connectDb();
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid scan id" });
  const scan = await ScanModel.findByIdAndDelete(id).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json({ message: "Scan deleted" });
});

app.post("/api/scans/:id/complete", async (req, res) => {
  await connectDb();
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid scan id" });
  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  const d = parsed.data;
  const update: Record<string, unknown> = {
    status: "completed",
    processedAt: d.processedAt ?? new Date(),
    result: { label: d.label, confidence: d.confidence, notes: d.notes },
    metadata: { localeDisease: d.localeDisease, severity: d.severity, severityLocal: d.severityLocal },
  };
  if (d.rawModelOutput !== undefined) update.rawModelOutput = d.rawModelOutput;

   // duplicate key fields for easier reads
  if (d.label) update.label = d.label;
  if (d.localeDisease) update.diseaseLocal = d.localeDisease;
  if (d.severity || d.severityLocal) update.severity = d.severity ?? d.severityLocal;
  if (typeof d.confidence === "number") update.confidence = Math.round(d.confidence * 100);

  const scan = await ScanModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json({
    message: "Scan completed",
    data: serializeScan(scan),
  });
});

app.post("/api/profile/avatar", upload.single("file"), async (req, res) => {
  await connectDb();
  const { userId } = req.body;
  if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: "Invalid user id" });
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  if (!req.file.mimetype?.startsWith("image/")) return res.status(400).json({ error: "Unsupported file type" });

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // simple resize is skipped here; assume frontend already resized or acceptable
  const keyPrefix = `avatars/${userId}`;
  const url = await uploadBuffer(req.file.buffer, keyPrefix, req.file.mimetype);

  user.avatarUrl = url;
  await user.save();
  res.json({ message: "Avatar updated", data: { id: user.id, avatarUrl: user.avatarUrl } });
});

app.post("/api/reports", async (req, res) => {
  await connectDb();
  const { scanId, reason, createdBy } = req.body || {};
  if (!mongoose.isValidObjectId(scanId)) return res.status(400).json({ error: "Invalid scan id" });
  if (!reason) return res.status(400).json({ error: "Reason is required" });
  const report = await ReportModel.create({ scan: scanId, reason, createdBy });
  res.status(201).json({ message: "Report created", data: { id: report._id.toString() } });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

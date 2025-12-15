import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { ScanModel } from "../models/Scan.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

const normalizeScan = (scan: any) => {
  if (!scan) return null;
  const { _id, ...rest } = scan;
  return { id: _id.toString(), ...rest };
};

export async function getScan(id: string) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid scan id");
  }

  const scan = await ScanModel.findById(id).lean();
  if (!scan) throw new NotFoundError("Scan not found");
  return normalizeScan(scan);
}

export async function updateScan(
  id: string,
  update: Record<string, unknown>
) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid scan id");
  }

  const scan = await ScanModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();

  if (!scan) throw new NotFoundError("Scan not found");
  return normalizeScan(scan);
}

export async function deleteScan(id: string) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid scan id");
  }

  const scan = await ScanModel.findByIdAndDelete(id).lean();
  if (!scan) throw new NotFoundError("Scan not found");
  return;
}

export async function completeScan(
  id: string,
  payload: {
    label?: string;
    confidence?: number;
    notes?: string;
    severity?: string;
    severityLocal?: string;
    localeDisease?: string;
    rawModelOutput?: unknown;
    processedAt?: Date;
  }
) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid scan id");
  }

  const update: Record<string, unknown> = {
    status: "completed",
    processedAt: payload.processedAt ?? new Date(),
  };

  const result: Record<string, unknown> = {};
  if (payload.label !== undefined) result["label"] = payload.label;
  if (payload.confidence !== undefined) result["confidence"] = payload.confidence;
  if (payload.notes !== undefined) result["notes"] = payload.notes;
  if (Object.keys(result).length) update["result"] = result;

  const metadata: Record<string, unknown> = {};
  if (payload.localeDisease !== undefined) metadata["localeDisease"] = payload.localeDisease;
  if (payload.severity !== undefined) metadata["severity"] = payload.severity;
  if (payload.severityLocal !== undefined) metadata["severityLocal"] = payload.severityLocal;
  if (Object.keys(metadata).length) update["metadata"] = metadata;

  if (payload.rawModelOutput !== undefined) update["rawModelOutput"] = payload.rawModelOutput;

  type LeanScan = {
    _id: mongoose.Types.ObjectId;
    status: string;
    processedAt?: Date;
    result?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };

  const scan = (await ScanModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  )
    .lean<LeanScan>()
    .exec()) as LeanScan | null;

  if (!scan) throw new NotFoundError("Scan not found");

  return {
    id: scan._id.toString(),
    status: scan.status,
    processedAt: scan.processedAt,
    result: scan.result,
    metadata: scan.metadata,
  };
}

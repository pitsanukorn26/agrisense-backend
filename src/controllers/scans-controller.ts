import { Request, Response, NextFunction } from "express";
import { scanUpdateSchema, scanCompleteSchema } from "../utils/validators.js";
import {
  completeScan as completeScanSvc,
  deleteScan as deleteScanSvc,
  getScan as getScanSvc,
  updateScan as updateScanSvc,
} from "../services/scans-service.js";
import { BadRequestError } from "../utils/errors.js";

export async function getScan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getScanSvc(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateScan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = scanUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid payload", parsed.error.flatten());
    }

    const d = parsed.data;
    const update: Record<string, unknown> = {};

    if (d.status !== undefined) update["status"] = d.status;
    if (d.failureReason !== undefined) update["failureReason"] = d.failureReason;
    if (d.processedAt !== undefined) update["processedAt"] = d.processedAt;
    if (d.metadata !== undefined) update["metadata"] = d.metadata;
    if (d.rawModelOutput !== undefined) update["rawModelOutput"] = d.rawModelOutput;

    if (d.result) {
      if (d.result.label !== undefined) update["result.label"] = d.result.label;
      if (d.result.confidence !== undefined)
        update["result.confidence"] = d.result.confidence;
      if (d.result.notes !== undefined) update["result.notes"] = d.result.notes;
      if (d.result.secondaryFindings !== undefined)
        update["result.secondaryFindings"] = d.result.secondaryFindings;
      if (d.result.diseaseId !== undefined)
        update["result.disease"] = d.result.diseaseId;
    }

    const scan = await updateScanSvc(req.params.id, update);
    res.json({ message: "Scan updated", data: scan });
  } catch (err) {
    next(err);
  }
}

export async function deleteScan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteScanSvc(req.params.id);
    res.json({ message: "Scan deleted" });
  } catch (err) {
    next(err);
  }
}

export async function completeScan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = scanCompleteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid payload", parsed.error.flatten());
    }

    const data = await completeScanSvc(req.params.id, parsed.data);
    res.json({ message: "Scan completed", data });
  } catch (err) {
    next(err);
  }
}

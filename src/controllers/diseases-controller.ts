import { Request, Response, NextFunction } from "express";
import {
  getDisease as getDiseaseSvc,
  listDiseases as listDiseasesSvc,
} from "../services/diseases-service.js";

export async function listDiseases(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listDiseasesSvc();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getDisease(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getDiseaseSvc(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const { AUTH_TOKEN, AUTH_BYPASS } = process.env;

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  if (AUTH_BYPASS === "true" || !AUTH_TOKEN) {
    return next();
  }

  const header = req.header("authorization");
  if (!header) return next(new UnauthorizedError());

  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (token !== AUTH_TOKEN) return next(new UnauthorizedError());

  req.userId = req.header("x-user-id") || req.userId;
  return next();
}

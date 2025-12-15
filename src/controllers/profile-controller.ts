import { Response, NextFunction, Request } from "express";
import type { Express } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { avatarUploadSchema } from "../utils/validators.js";
import { BadRequestError } from "../utils/errors.js";
import { updateAvatar as updateAvatarSvc } from "../services/profile-service.js";

type UploadRequest = AuthenticatedRequest &
  Request & { file?: Express.Multer.File };

export async function uploadAvatar(
  req: UploadRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = avatarUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError("Invalid payload", parsed.error.flatten());
    }
    if (!req.file) {
      throw new BadRequestError("Missing file upload");
    }

    const data = await updateAvatarSvc(parsed.data.userId, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
    });

    res.json({ message: "Avatar updated", data });
  } catch (err) {
    next(err);
  }
}

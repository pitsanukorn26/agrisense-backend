import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { UserModel } from "../models/User.js";
import { uploadBuffer } from "./storage-service.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

export async function updateAvatar(
  userId: string,
  file: { buffer: Buffer; mimetype: string }
) {
  await connectDb();
  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequestError("Invalid user id");
  }

  if (!file) {
    throw new BadRequestError("Missing file upload");
  }

  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const ext = mimeToExt(file.mimetype) ?? "bin";
  const key = `avatars/${userId}-${Date.now()}.${ext}`;
  const url = await uploadBuffer(file.buffer, key, file.mimetype);

  user.avatarUrl = url;
  await user.save();

  return { id: user.id, avatarUrl: user.avatarUrl };
}

const mimeMap: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

function mimeToExt(mimetype: string | undefined) {
  if (!mimetype) return null;
  return mimeMap[mimetype] ?? null;
}

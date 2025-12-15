import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, index: true },
    name: { type: String },
    avatarUrl: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

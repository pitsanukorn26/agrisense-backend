import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["farmer", "expert", "admin"], default: "farmer" },
    organization: { type: String, trim: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

export const UserModel: Model<any> = (models.User as Model<any>) || model("User", userSchema);

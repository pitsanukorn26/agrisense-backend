import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const actorSchema = new Schema({ id: { type: String, required: true }, email: { type: String, required: true }, name: { type: String } }, { _id: false });
const targetSchema = new Schema({ id: { type: String, required: true }, email: { type: String }, name: { type: String } }, { _id: false });

const adminLogSchema = new Schema(
  {
    actor: { type: actorSchema, required: true },
    action: { type: String, enum: ["role.promote", "role.demote", "role.update", "custom"], required: true },
    target: { type: targetSchema, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

adminLogSchema.index({ createdAt: -1 });

export const AdminLogModel: Model<any> =
  (models.AdminLog as Model<any>) || model("AdminLog", adminLogSchema);

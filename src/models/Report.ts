import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const reportSchema = new Schema(
  {
    scan: { type: Schema.Types.ObjectId, ref: "Scan", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true, trim: true, maxlength: 400 },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    resolutionNote: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

export const ReportModel: Model<any> = (models.Report as Model<any>) || model("Report", reportSchema);

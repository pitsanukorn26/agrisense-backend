import mongoose, { Schema } from "mongoose";

const SecondaryFindingSchema = new Schema(
  {
    label: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 },
  },
  { _id: false }
);

const ScanResultSchema = new Schema(
  {
    disease: { type: Schema.Types.ObjectId, ref: "Disease" },
    label: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    notes: { type: String },
    secondaryFindings: { type: [SecondaryFindingSchema], default: [] },
  },
  { _id: false }
);

const ScanSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    failureReason: { type: String },
    processedAt: { type: Date },

    // main outputs
    result: { type: ScanResultSchema, default: {} },

    // any misc metadata
    metadata: { type: Schema.Types.Mixed, default: {} },

    // raw model output blob
    rawModelOutput: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ScanModel =
  mongoose.models.Scan || mongoose.model("Scan", ScanSchema);

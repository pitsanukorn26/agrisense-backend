import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const locationSchema = new Schema(
  {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    name: { type: String, trim: true },
  },
  { _id: false },
);

const resultSchema = new Schema(
  {
    disease: { type: Schema.Types.ObjectId, ref: "Disease" },
    label: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1 },
    notes: { type: String },
    secondaryFindings: {
      type: [
        new Schema(
          {
            label: { type: String, trim: true },
            confidence: { type: Number, min: 0, max: 1 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
);

const scanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    failureReason: { type: String },
    modelVersion: { type: String },
    result: { type: resultSchema },
    capturedAt: { type: Date },
    processedAt: { type: Date },
    location: { type: locationSchema },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    rawModelOutput: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

scanSchema.index({ user: 1, createdAt: -1 });
scanSchema.index({ "result.disease": 1 });

export const ScanModel: Model<any> = (models.Scan as Model<any>) || model("Scan", scanSchema);

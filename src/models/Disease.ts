import mongoose, { Schema } from "mongoose";

const DiseaseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    symptoms: { type: [String], default: [] },
    treatments: { type: [String], default: [] },
    locale: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DiseaseModel =
  mongoose.models.Disease || mongoose.model("Disease", DiseaseSchema);

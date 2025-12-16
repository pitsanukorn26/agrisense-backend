import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const diseaseSchema = new Schema(
  {
    crop: { type: String, required: true, enum: ["durian", "sugarcane", "rice"] },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    symptoms: { type: [String], default: [] },
    treatments: { type: [String], default: [] },
  },
  { timestamps: true },
);

diseaseSchema.index({ crop: 1, name: 1 }, { unique: true });

export const DiseaseModel: Model<any> = (models.Disease as Model<any>) || model("Disease", diseaseSchema);

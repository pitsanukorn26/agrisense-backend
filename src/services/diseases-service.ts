import mongoose from "mongoose";
import { connectDb } from "../db.js";
import { DiseaseModel } from "../models/Disease.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

const normalize = (d: any) => {
  const { _id, ...rest } = d;
  return { id: _id.toString(), ...rest };
};

export async function listDiseases() {
  await connectDb();
  const diseases = await DiseaseModel.find().lean();
  return diseases.map(normalize);
}

export async function getDisease(id: string) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid disease id");
  }
  const disease = await DiseaseModel.findById(id).lean();
  if (!disease) throw new NotFoundError("Disease not found");
  return normalize(disease);
}

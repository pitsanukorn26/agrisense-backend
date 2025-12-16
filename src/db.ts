import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  return uri;
}

const mongoUri = getMongoUri();

let conn: typeof mongoose | null = null;
let connPromise: Promise<typeof mongoose> | null = null;

export async function connectDb() {
  if (conn) return conn;
  if (!connPromise) {
    connPromise = mongoose.connect(mongoUri, { bufferCommands: false });
  }
  conn = await connPromise;
  return conn;
}

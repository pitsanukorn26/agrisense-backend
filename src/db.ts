import mongoose from "mongoose";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const MONGODB_URI = requireEnv("MONGODB_URI");

let conn: typeof mongoose | null = null;
let connPromise: Promise<typeof mongoose> | null = null;

export async function connectDb() {
  if (conn) return conn;
  if (!connPromise) {
    connPromise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  conn = await connPromise;
  return conn;
}

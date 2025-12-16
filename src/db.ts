import mongoose from "mongoose";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) throw new Error("MONGODB_URI is required");

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

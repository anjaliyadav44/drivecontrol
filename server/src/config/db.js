import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

function redact(uri) {
  return String(uri).replace(/\/\/([^:/]+):([^@]+)@/, "//$1:***@");
}

export async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/drivecontrol";
  const isProd = process.env.NODE_ENV === "production";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: isProd ? 8000 : 2500 });
    console.log(`DriveControl DB connected: ${redact(uri)}`);
    return { mode: "persistent", uri };
  } catch (err) {
    if (isProd) {
      console.error(`Production MongoDB connection failed: ${err.message}`);
      throw err;
    }
    console.warn(`Could not reach MongoDB at ${redact(uri)} (${err.message})`);
    console.warn("Starting free in-memory MongoDB (data resets when the server stops).");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("DriveControl DB connected: in-memory MongoDB");
    return { mode: "memory", uri: memUri };
  }
}

import { ENV } from "./env.js";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${ENV.dbUri}/${ENV.dbName}`);
    console.log("Database conected : ", conn.connection.host);
  } catch (error) {
    console.log("Database connection error: ", error);
  }
};

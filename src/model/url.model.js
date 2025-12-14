import { Schema, model } from "mongoose";

const urlSchema = new Schema(
  {
    slug: { type: String, unique: true },
    originalUrl: String,
    totalClicks: { type: Number, default: 0 },
    lastVisited: Date,
  },
  { timestamps: true }
);

export const URL = model("url", urlSchema);

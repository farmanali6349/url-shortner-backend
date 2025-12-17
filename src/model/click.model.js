import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: "urls" },
    slug: String,
    ip: String,
    userAgent: String,
    device: String,
    browser: String,
    os: String,
    referer: String,
    country: String,
  },
  { timestamps: true }
);

export const Click = mongoose.model("click", clickSchema);

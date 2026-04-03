// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    photoUrl: { type: String, default: "" },
    tokens: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
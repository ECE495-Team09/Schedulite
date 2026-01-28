// backend/src/models/Group.js
import mongoose from "mongoose";

//Internal sub schema for group members
const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      default: "MEMBER",
      required: true
    }
  },
  { _id: false }
);

//Main Group schema
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    joinCode: { type: String, required: true, unique: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] }
  },
  { timestamps: true }
);

//This index speeds up queries when searching for groups by member userId
groupSchema.index({ "members.userId": 1 });

export const Group = mongoose.model("Group", groupSchema);
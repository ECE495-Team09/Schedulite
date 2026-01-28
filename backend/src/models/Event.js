// backend/src/models/Event.js
import mongoose from "mongoose";

//Internal sub schema for event RSVPs
const rsvpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["NOT_RESPONDED", "YES", "NO", "MAYBE"],
      default: "NOT_RESPONDED",
      required: true
    },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

//Main Event schema
const eventSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["ACTIVE", "CANCELLED", "ENDED"], default: "ACTIVE" },
    //The actual list of RSVPs for this event
    rsvps: { type: [rsvpSchema], default: [] }
  },
  { timestamps: true }
);

//Index by Group and User for faster RSVP lookups
eventSchema.index({ groupId: 1, "rsvps.userId": 1 });

export const Event = mongoose.model("Event", eventSchema);
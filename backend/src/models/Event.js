// backend/src/models/Event.js
import mongoose from "mongoose";

const reminderDeliverySchema = new mongoose.Schema(
  {
    occurrenceStart: { type: Date, required: true },
    offsetMinutes: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

//Internal sub schema for event RSVPs
const rsvpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["NOT_RESPONDED", "YES", "NO", "MAYBE", "In", "Out", "Maybe"],
      default: "NOT_RESPONDED",
      required: true
    },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
    lastNotified: { type: Date, default: null }
  },
  { _id: false }
);

const recurrenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["NONE", "DAILY", "WEEKLY", "MONTHLY"],
      default: "NONE",
    },
    interval: { type: Number, default: 1, min: 1 },
    /** 0=Sun … 6=Sat (JS getDay); used when type is WEEKLY */
    weekdays: { type: [Number], default: [] },
    until: { type: Date, default: null },
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
    recurrence: { type: recurrenceSchema, default: () => ({}) },
    /** e.g. [30, 1440] = 30 min and 24h before each occurrence */
    reminderOffsetsMinutes: { type: [Number], default: [1440] },
    reminderDeliveries: { type: [reminderDeliverySchema], default: [] },
    //The actual list of RSVPs for this event
    rsvps: { type: [rsvpSchema], default: [] }
  },
  { timestamps: true }
);

//Index by Group and User for faster RSVP lookups
eventSchema.index({ groupId: 1, "rsvps.userId": 1 });

export const Event = mongoose.model("Event", eventSchema);

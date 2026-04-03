import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { getGroupIfMember } from "../services/groupAccess.js";
import { notifyEventCreated } from "../services/notificationService.js";

const router = express.Router();

function normalizeRecurrence(raw) {
  if (!raw || typeof raw !== "object") {
    return { type: "NONE", interval: 1, weekdays: [], until: null };
  }
  const type = ["NONE", "DAILY", "WEEKLY", "MONTHLY"].includes(raw.type)
    ? raw.type
    : "NONE";
  const interval = Math.max(1, parseInt(raw.interval, 10) || 1);
  const weekdays = Array.isArray(raw.weekdays)
    ? raw.weekdays.map(Number).filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
    : [];
  let until = null;
  if (raw.until) {
    const u = new Date(raw.until);
    if (!isNaN(u.getTime())) until = u;
  }
  return { type, interval, weekdays, until };
}

function normalizeReminderOffsets(raw) {
  if (!Array.isArray(raw)) return [1440];
  const nums = raw
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 10080);
  return nums.length ? [...new Set(nums)].sort((a, b) => a - b) : [1440];
}

router.post("/", async (req, res) => {
  try {
    const {
      groupId,
      title,
      startAt,
      location,
      description,
      recurrence: recurrenceRaw,
      reminderOffsetsMinutes: reminderRaw,
    } = req.body;

    //Basic validation
    if (!groupId || !title || !startAt) {
      return res.status(400).json({
        message: "groupId, title, and startAt are required",
      });
    }

    //Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    //Validate date
    const parsedDate = new Date(startAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid startAt date" });
    }

    // Query scoping: only allow creating events in groups the user belongs to
    const group = await getGroupIfMember(groupId, req.user.userId);
    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const recurrence = normalizeRecurrence(recurrenceRaw);
    const reminderOffsetsMinutes = normalizeReminderOffsets(reminderRaw);

    const newEvent = new Event({
      groupId,
      createdBy: req.user.userId,
      title: title.trim(),
      startAt: parsedDate,
      location: location || "",
      description: description || "",
      recurrence,
      reminderOffsetsMinutes,
    });

    const savedEvent = await newEvent.save();

    try {
      const recipientIds = group.members.map((m) => m.userId.toString());
      await notifyEventCreated(savedEvent, recipientIds);
    } catch (notifErr) {
      console.error("Notification error (event_created):", notifErr);
    }

    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      message: "Server error while creating event",
    });
  }
});

export default router;

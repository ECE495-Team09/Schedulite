// backend/src/routes/manageEvents.js
// Update, delete, and manual-reminder routes for events.
// All handlers validate group membership (via requireAdmin) before returning or mutating event data.

import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Group } from "../models/Group.js";
import {
  notifyEventUpdated,
  notifyEventDeleted,
  sendManualReminder,
} from "../services/notificationService.js";

const router = express.Router();

// ── helper: get recipient user IDs from an event's group ──────────────────
async function getGroupMemberIds(groupId) {
  const group = await Group.findById(groupId).select("members");
  if (!group) return [];
  return group.members.map((m) => m.userId.toString());
}

// ── helper: verify requester is ADMIN or OWNER of the event's group ───────
async function requireAdmin(group, requesterId) {
  if (!group) return false;
  const member = group.members.find(
    (m) => m.userId.toString() === requesterId.toString()
  );
  return member && (member.role === "OWNER" || member.role === "ADMIN");
}

// ── PUT /:eventId — update event ──────────────────────────────────────────
router.put("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const group = await Group.findById(event.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!(await requireAdmin(group, req.user.userId))) {
      return res.status(403).json({ message: "Only admins/owners can update events" });
    }

    const allowedFields = [
      "title",
      "startAt",
      "location",
      "description",
      "status",
      "recurrence",
      "reminderOffsetsMinutes",
    ];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === "startAt") {
          event[key] = new Date(req.body[key]);
        } else if (key === "recurrence" && req.body.recurrence && typeof req.body.recurrence === "object") {
          const r = req.body.recurrence;
          event.recurrence = {
            type: ["NONE", "DAILY", "WEEKLY", "MONTHLY"].includes(r.type) ? r.type : "NONE",
            interval: Math.max(1, parseInt(r.interval, 10) || 1),
            weekdays: Array.isArray(r.weekdays)
              ? r.weekdays.map(Number).filter((n) => n >= 0 && n <= 6)
              : [],
            until: r.until ? new Date(r.until) : null,
          };
        } else if (key === "reminderOffsetsMinutes" && Array.isArray(req.body.reminderOffsetsMinutes)) {
          event.reminderOffsetsMinutes = req.body.reminderOffsetsMinutes
            .map((n) => parseInt(n, 10))
            .filter((n) => Number.isFinite(n) && n > 0 && n <= 10080);
        } else {
          event[key] = req.body[key];
        }
      }
    }

    const saved = await event.save();

    // Notify all group members about the update
    try {
      const recipientIds = await getGroupMemberIds(event.groupId);
      await notifyEventUpdated(saved, recipientIds);
    } catch (notifErr) {
      console.error("Notification error (event_updated):", notifErr);
    }

    return res.json(saved);
  } catch (err) {
    console.error("Update Event Error:", err);
    return res.status(500).json({ message: "Server error while updating event" });
  }
});

// ── DELETE /:eventId — delete (cancel) event ──────────────────────────────
router.delete("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const group = await Group.findById(event.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!(await requireAdmin(group, req.user.userId))) {
      return res.status(403).json({ message: "Only admins/owners can delete events" });
    }

    // Collect recipients BEFORE deletion so we still have groupId
    let recipientIds = [];
    try {
      recipientIds = await getGroupMemberIds(event.groupId);
    } catch (_) {}

    await Event.findByIdAndDelete(eventId);

    // Notify
    try {
      await notifyEventDeleted(event, recipientIds);
    } catch (notifErr) {
      console.error("Notification error (event_deleted):", notifErr);
    }

    return res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete Event Error:", err);
    return res.status(500).json({ message: "Server error while deleting event" });
  }
});

// ── POST /:eventId/remind — send manual reminder ─────────────────────────
// Sends to all current group members.
router.post("/:eventId/remind", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const group = await Group.findById(event.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!(await requireAdmin(group, req.user.userId))) {
      return res.status(403).json({ message: "Only admins/owners can send reminders" });
    }

    const recipientIds = await getGroupMemberIds(event.groupId);

    if (recipientIds.length > 0) {
      await sendManualReminder(event, recipientIds);
    }

    return res.json({
      attempted: recipientIds.length,
      sent: recipientIds.length,
      skippedCooldown: 0,
    });
  } catch (err) {
    console.error("Manual Reminder Error:", err);
    return res.status(500).json({ message: "Server error while sending reminder" });
  }
});

export default router;

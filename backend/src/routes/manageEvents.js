// backend/src/routes/manageEvents.js
// Update, delete, and manual-reminder routes for events.

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

const REMINDER_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

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
    if (!(await requireAdmin(group, req.user.userId))) {
      return res.status(403).json({ message: "Only admins/owners can update events" });
    }

    const allowedFields = ["title", "startAt", "location", "description", "status"];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        event[key] = key === "startAt" ? new Date(req.body[key]) : req.body[key];
      }
    }

    const saved = await event.save();

    // Notify all group members about the update
    try {
      const recipientIds = await getGroupMemberIds(event.groupId);
      notifyEventUpdated(saved, recipientIds);
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
      notifyEventDeleted(event, recipientIds);
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
// Sends to NOT_RESPONDED RSVP users only, respecting 12-hour cooldown.
router.post("/:eventId/remind", async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const group = await Group.findById(event.groupId);
    if (!(await requireAdmin(group, req.user.userId))) {
      return res.status(403).json({ message: "Only admins/owners can send reminders" });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - REMINDER_COOLDOWN_MS);

    // Filter to NOT_RESPONDED users who are NOT in cooldown
    const eligible = [];
    const skippedCooldown = [];

    for (const rsvp of event.rsvps) {
      if (rsvp.status !== "NOT_RESPONDED") continue;

      if (rsvp.lastNotified && rsvp.lastNotified > cutoff) {
        skippedCooldown.push(rsvp.userId.toString());
      } else {
        eligible.push(rsvp.userId.toString());
      }
    }

    // Send notification for eligible recipients
    if (eligible.length > 0) {
      sendManualReminder(event, eligible);

      // Atomically update lastNotified only for recipients we actually notified
      await Event.updateOne(
        { _id: eventId },
        {
          $set: Object.fromEntries(
            eligible.map((uid) => {
              const idx = event.rsvps.findIndex(
                (r) => r.userId.toString() === uid
              );
              return [`rsvps.${idx}.lastNotified`, now];
            })
          ),
        }
      );
    }

    return res.json({
      attempted: eligible.length + skippedCooldown.length,
      sent: eligible.length,
      skippedCooldown: skippedCooldown.length,
    });
  } catch (err) {
    console.error("Manual Reminder Error:", err);
    return res.status(500).json({ message: "Server error while sending reminder" });
  }
});

export default router;

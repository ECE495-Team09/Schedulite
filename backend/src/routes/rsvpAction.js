import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Group } from "../models/Group.js";
import { verifyRsvpActionToken } from "../services/rsvpActionToken.js";

const router = express.Router();

const ACTION_TO_STATUS = {
  IN: "In",
  OUT: "Out",
  MAYBE: "Maybe",
};

function resolveAction(req) {
  const raw = (req.body?.action || req.query?.a || "").toString().trim().toUpperCase();
  return ACTION_TO_STATUS[raw] ? raw : null;
}

function upsertRsvp(event, userId, status) {
  const existing = event.rsvps.find((r) => r.userId.toString() === userId.toString());
  if (existing) {
    existing.status = status;
    existing.note = "";
    existing.updatedAt = new Date();
    return;
  }
  event.rsvps.push({
    userId,
    status,
    note: "",
    updatedAt: new Date(),
  });
}

async function handleAction(req, res) {
  try {
    const token = (req.body?.token || req.query?.t || "").toString().trim();
    const action = resolveAction(req);
    if (!token || !action) {
      return res.status(400).json({ message: "token and action are required" });
    }

    let decoded;
    try {
      decoded = verifyRsvpActionToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid or expired action token" });
    }

    const userId = decoded?.uid?.toString();
    const eventId = decoded?.eid?.toString();
    const groupId = decoded?.gid?.toString();
    if (!userId || !eventId || !groupId) {
      return res.status(401).json({ message: "Invalid action token payload" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(groupId)
    ) {
      return res.status(401).json({ message: "Invalid action token identifiers" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.groupId.toString() !== groupId) {
      return res.status(403).json({ message: "Event/group mismatch" });
    }

    const group = await Group.findById(groupId).select("members");
    const member = group?.members?.some((m) => m.userId.toString() === userId);
    if (!member) {
      return res.status(403).json({ message: "User is not a group member" });
    }

    const status = ACTION_TO_STATUS[action];
    upsertRsvp(event, userId, status);
    await event.save();

    const response = {
      ok: true,
      message: `RSVP updated to ${status}`,
      eventId,
      groupId,
      status,
    };

    if (req.method === "GET") {
      return res
        .status(200)
        .send(
          `<!doctype html><html><body><h3>RSVP saved: ${status}</h3><p>You can close this page.</p></body></html>`
        );
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("RSVP action route error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

router.get("/rsvp-action", handleAction);
router.post("/rsvp-action", handleAction);

export default router;

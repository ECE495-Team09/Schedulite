import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";

const router = express.Router();

const ALLOWED_STATUSES = ["In", "Out", "Maybe"];

function normalizeRsvpForResponse(rsvp) {
  return {
    userId: rsvp.userId,
    status: rsvp.status,
    note: rsvp.note || "",
    updatedAt: rsvp.updatedAt,
  };
}

function validateInput(status, note) {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "status must be one of: In, Out, Maybe" };
  }

  if (note !== undefined && typeof note !== "string") {
    return { ok: false, error: "note must be a string" };
  }

  return { ok: true };
}

// POST /eventRSVP/:eventId/rsvp
// Creates a new RSVP or overwrites the current user's existing RSVP.
router.post("/:eventId/rsvp", async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const validation = validateInput(req.body.status, req.body.note);
    if (!validation.ok) {
      return res.status(400).json({ message: validation.error });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const note = req.body.note ?? "";
    const updatedAt = new Date();

    const existing = event.rsvps.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existing) {
      existing.status = req.body.status;
      existing.note = note;
      existing.updatedAt = updatedAt;
      await event.save();

      return res.status(200).json({
        message: "RSVP replaced",
        rsvp: normalizeRsvpForResponse(existing),
        rsvps: event.rsvps.map(normalizeRsvpForResponse),
      });
    }

    event.rsvps.push({
      userId,
      status: req.body.status,
      note,
      updatedAt,
    });

    await event.save();

    const created = event.rsvps.find(
      (r) => r.userId.toString() === userId.toString()
    );

    return res.status(201).json({
      message: "RSVP created",
      rsvp: normalizeRsvpForResponse(created),
      rsvps: event.rsvps.map(normalizeRsvpForResponse),
    });
  } catch (error) {
    console.error("Create/replace RSVP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /eventRSVP/:eventId/rsvp
// Updates the current user's existing RSVP. Returns error if RSVP does not exist.
router.put("/:eventId/rsvp", async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const validation = validateInput(req.body.status, req.body.note);
    if (!validation.ok) {
      return res.status(400).json({ message: validation.error });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = event.rsvps.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (!existing) {
      return res.status(404).json({ message: "RSVP not found for this user" });
    }

    existing.status = req.body.status;
    existing.note = req.body.note ?? "";
    existing.updatedAt = new Date();

    await event.save();

    return res.status(200).json({
      message: "RSVP updated",
      rsvp: normalizeRsvpForResponse(existing),
      rsvps: event.rsvps.map(normalizeRsvpForResponse),
    });
  } catch (error) {
    console.error("Update RSVP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
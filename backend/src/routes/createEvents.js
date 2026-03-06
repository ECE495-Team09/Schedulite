import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Group } from "../models/Group.js";
import { notifyEventCreated } from "../services/notificationService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { groupId, title, startAt, location, description } = req.body;

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

    const newEvent = new Event({
      groupId,
      createdBy: req.user.userId,
      title: title.trim(),
      startAt: parsedDate,
      location: location || "",
      description: description || "",
    });

    const savedEvent = await newEvent.save();

    // Notify all group members about the new event
    try {
      const group = await Group.findById(groupId).select("members");
      if (group) {
        const recipientIds = group.members.map((m) => m.userId.toString());
        notifyEventCreated(savedEvent, recipientIds);
      }
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

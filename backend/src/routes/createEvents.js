import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";

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
      createdBy: req.user._id,
      title: title.trim(),
      startAt: parsedDate,
      location: location || "",
      description: description || "",
    });

    const savedEvent = await newEvent.save();

    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      message: "Server error while creating event",
    });
  }
});

export default router;

import express from "express";
import mongoose from "mongoose";
import Event from "../models/eventSchema.js";
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/html', 'main.html'));
});

router.get('/dash', (req,res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/html', 'dashboard.html'));
})

// POST /api/events — create a new event
router.post("/post", async (req, res) => {
  try {
    const { title, startTime, endTime, location, description, groupId, invitationList } = req.body;

    if (!title || !startTime || !endTime || !location || !groupId || !invitationList?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const responses = {
      notResponded: invitationList.map(p => ({ name: p.name })),
      in: [],
      out: []
    };

    const event = await Event.create({
      title,
      startTime,
      endTime,
      location,
      description,
      groupId,
      invitationList,
      responses
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET /api/events/:id — fetch event by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// DELETE /api/events/:id — delete an event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;

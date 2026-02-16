import express from "express";
import { Group } from "../models/Group.js";
import { requireAuth } from "../middleware/requireAuth.js";
import mongoose from "mongoose";

const router = express.Router();

//generates join code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

//Posts new group
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized " + userId});
    }

    //Ensure joinCode uniqueness
    let joinCode;
    let exists = true;

    while (exists) {
      joinCode = generateJoinCode();
      exists = await Group.exists({ joinCode });
    }

    const group = new Group({
      name,
      joinCode,
      ownerId: userId,
      members: [
        {
          userId,
          role: "OWNER"
        }
      ]
    });

    await group.save();

    res.status(201).json({
      message: "Group created successfully",
      group
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
import express from "express";
import { Group } from "../models/Group.js";
import { requireAuth } from "../middleware/requireAuth.js";
import mongoose from "mongoose";

const router = express.Router();

//Posts new member in group
router.post("/", requireAuth, async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user.userId;

    if (!joinCode) {
      return res.status(400).json({ message: "Join code is required" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const group = await Group.findOne({ joinCode });

    if (!group) {
      return res.status(404).json({ message: "Invalid join code" });
    }

    //Check if user is already a member
    const alreadyMember = group.members.some(
      (member) => member.userId.toString() === userId
    );

    if (alreadyMember) {
      return res.status(409).json({ message: "User already in group" });
    }

    //Add user as MEMBER
    group.members.push({
      userId,
      role: "MEMBER"
    });

    await group.save();

    res.status(200).json({
      message: "Successfully joined group",
      group
    });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;